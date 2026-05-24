import { useState, useRef, useEffect } from "react";
import { FiMessageCircle, FiX, FiSend, FiMinimize2 } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0">
      <RiRobot2Line className="text-white text-xs" />
    </div>
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
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

const ChatMessage = ({ msg }) => {
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
              : "bg-white/10 backdrop-blur-md border border-white/10 text-white/90 rounded-bl-sm"
            }`}
        >
          {msg.content}
        </div>

        {/* Sources */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {msg.sources.map((s, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 bg-red-900/40 border border-red-700/30 text-red-300 rounded-full"
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

  // Kiểm tra AI service có sẵn sàng không
  useEffect(() => {
    fetch(`${AI_SERVICE_URL}/chat/health`)
      .then(r => r.json())
      .then(data => setIsReady(data.ready))
      .catch(() => setIsReady(false));
  }, [isOpen]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput("");
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

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        sources: data.sources || []
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.",
        sources: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10, 0, 0, 0.92)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(200, 16, 46, 0.25)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,16,46,0.1), inset 0 1px 0 rgba(255,255,255,0.05)"
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(180,0,30,0.8), rgba(120,0,20,0.6))",
              borderBottom: "1px solid rgba(200,16,46,0.2)"
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center">
                  <RiRobot2Line className="text-white text-lg" />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${isReady ? "bg-green-400" : "bg-yellow-400"}`} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">VehicleChain AI</p>
                <p className="text-white/60 text-[11px]">{isReady ? "Sẵn sàng tư vấn" : "Đang khởi động..."}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0 scrollbar-thin">
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(200,16,46,0.15)" }}
          >
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(200,16,46,0.2)"
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về bảo hiểm xe cơ giới..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-white text-sm placeholder-white/30 resize-none outline-none leading-5 max-h-24 overflow-y-auto"
                style={{ minHeight: "20px" }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className={`p-2 rounded-lg transition-all flex-shrink-0
                  ${input.trim() && !isLoading
                    ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                  }`}
              >
                <FiSend size={15} />
              </button>
            </div>
            <p className="text-center text-white/20 text-[10px] mt-1.5">
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
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-xl text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
              Tư vấn bảo hiểm AI
            </div>
          )}
        </div>
      </div>
    </>
  );
}
