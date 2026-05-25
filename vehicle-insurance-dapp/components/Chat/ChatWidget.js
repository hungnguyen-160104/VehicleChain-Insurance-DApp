import { useState, useRef, useEffect } from "react";
import { FiMessageCircle, FiX, FiSend, FiMinimize2 } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0">
      <RiRobot2Line className="text-white text-xs" />
    </div>
    <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const ChatMessage = ({ msg, onRetry }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
          ${isUser
            ? "bg-gradient-to-br from-red-500 to-red-700 text-white"
            : "bg-gradient-to-br from-red-600 to-red-900 text-white"
          }`}
      >
        {isUser ? "U" : <RiRobot2Line />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${isUser
              ? "bg-gradient-to-br from-red-600 to-red-700 text-white rounded-br-sm"
              : msg.isRateLimit
                ? "bg-amber-50 border border-amber-200 text-amber-800 rounded-bl-sm"
                : "bg-gray-100 border border-gray-200 text-gray-800 rounded-bl-sm"
            }`}
        >
          {msg.content}
        </div>

        {/* Retry button for rate limit errors */}
        {msg.isRateLimit && onRetry && (
          <button
            onClick={() => onRetry(msg.retryQuestion)}
            className="flex items-center gap-1.5 mt-1 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            🔄 Thử lại câu hỏi
          </button>
        )}

        {/* Sources */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {msg.sources.map((s, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-full"
              >
                📄 {s.filename.replace(/^[a-f0-9-]{36}\.pdf$/, "Tài liệu")}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý AI của VehicleChain Insurance. Tôi có thể giúp bạn tra cứu thông tin về bảo hiểm xe cơ giới, điều khoản hợp đồng và quy trình bồi thường. Bạn muốn hỏi gì?",
      sources: []
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [lastQuestion, setLastQuestion] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Cuộn xuống cuối
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Kiểm tra AI service có sẵn sàng không — poll mỗi 8 giây
  useEffect(() => {
    const checkHealth = () => {
      fetch(`${AI_SERVICE_URL}/chat/health`)
        .then(r => r.json())
        .then(data => setIsReady(data.ready === true))
        .catch(() => setIsReady(false));
    };
    checkHealth();
    const timer = setInterval(checkHealth, 8000);
    return () => clearInterval(timer);
  }, []);

  const sendMessage = async (questionOverride) => {
    const question = (questionOverride || input).trim();
    if (!question || isLoading) return;

    setInput("");
    setLastQuestion(question);
    setMessages(prev => [...prev, { role: "user", content: question, sources: [] }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${AI_SERVICE_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      if (!res.ok) throw new Error("Lỗi kết nối AI service");
      const data = await res.json();

      if (data.error === "rate_limit") {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "⚠️ Gemini API đang bị giới hạn lưu lượng. Vui lòng nhấn \"Thử lại\" sau 1-2 phút.",
          sources: [],
          isRateLimit: true,
          retryQuestion: question
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.answer,
          sources: data.sources || []
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "❌ Không thể kết nối AI service. Vui lòng kiểm tra server đang chạy.",
        sources: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(); // no override → uses current input
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-2xl"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #C8102E, #a00d24)",
              borderBottom: "1px solid rgba(200,16,46,0.2)"
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-red-700 flex items-center justify-center">
                  <RiRobot2Line className="text-white text-lg" />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white transition-colors duration-500 ${isReady ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">VehicleChain AI</p>
                <p className="text-white/70 text-[11px]">{isReady ? "Sẵn sàng tư vấn" : "Chưa có tài liệu — vẫn có thể hỏi"}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* No-docs banner */}
          {!isReady && (
            <div className="px-3 pt-2 pb-0 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700">
                <span>⚠️</span>
                <span>Chưa có tài liệu trong ChromaDB. Vào <strong>Admin → Tài Liệu AI</strong> để upload PDF.</span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0 scrollbar-thin bg-white">
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} onRetry={sendMessage} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 py-3 flex-shrink-0 bg-white"
            style={{ borderTop: "1px solid #f3f4f6" }}
          >
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2 bg-gray-50"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về bảo hiểm xe cơ giới..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-400 resize-none outline-none leading-5 max-h-24 overflow-y-auto"
                style={{ minHeight: "20px" }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className={`p-2 rounded-lg transition-all flex-shrink-0
                  ${input.trim() && !isLoading
                    ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
              >
                <FiSend size={15} />
              </button>
            </div>
            <p className="text-center text-gray-400 text-[10px] mt-1.5">
              Trả lời dựa trên tài liệu bảo hiểm đã được duyệt
            </p>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          {/* Glow ring */}
          {!isOpen && (
            <div className="absolute inset-0 bg-red-600 rounded-full blur-md opacity-40 animate-pulse" />
          )}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200
              ${isOpen
                ? "bg-gradient-to-br from-red-700 to-red-900 scale-95"
                : "bg-gradient-to-br from-red-500 to-red-700 hover:scale-110 hover:shadow-red-500/40"
              }`}
            style={{ boxShadow: isOpen ? "none" : "0 8px 32px rgba(200,16,46,0.5)" }}
            title="Tư vấn bảo hiểm AI"
          >
            {isOpen
              ? <FiX className="text-white" size={22} />
              : <FiMessageCircle className="text-white" size={24} />
            }
          </button>
          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 pointer-events-none">
              Tư vấn bảo hiểm AI
            </div>
          )}
        </div>
      </div>
    </>
  );
}
