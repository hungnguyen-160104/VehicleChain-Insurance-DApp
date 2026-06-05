import { useState, useEffect, useRef } from "react";
import {
  FiUpload, FiTrash2, FiFileText,
  FiRefreshCw, FiAlertCircle, FiCheckCircle, FiLoader,
  FiLock, FiLogIn,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { useEthersSigner } from "../../provider/hooks";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";
const TOKEN_KEY = "vc_ai_admin_token";

// ─── Hook: quản lý JWT token cho AI service ───────────────────────────
function useAiAuth() {
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) {
      // Kiểm tra token còn hợp lệ không
      fetch(`${AI_SERVICE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then((r) => {
          if (r.ok) setToken(saved);
          else sessionStorage.removeItem(TOKEN_KEY);
        })
        .catch(() => sessionStorage.removeItem(TOKEN_KEY))
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  // Đăng nhập bằng chữ ký ví owner (Sign-In With Ethereum)
  const loginWithWallet = async (signer, address) => {
    if (!signer || !address) throw new Error("Vui lòng kết nối ví owner trước");

    // Bước 1: lấy thông điệp cần ký
    const chRes = await fetch(`${AI_SERVICE_URL}/auth/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    if (!chRes.ok) {
      const data = await chRes.json().catch(() => ({}));
      throw new Error(data.detail || "Không tạo được thông điệp đăng nhập");
    }
    const { message } = await chRes.json();

    // Bước 2: ký thông điệp bằng ví
    const signature = await signer.signMessage(message);

    // Bước 3: gửi chữ ký để nhận JWT
    const res = await fetch(`${AI_SERVICE_URL}/auth/wallet-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, signature }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || "Đăng nhập thất bại");
    }
    const data = await res.json();
    sessionStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    return data.access_token;
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return { token, checking, loginWithWallet, logout };
}

// ─── Login Form ───────────────────────────────────────────────────────
const WalletLoginForm = ({ onLogin }) => {
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleSignIn = async () => {
    if (!isConnected || !signer || !address) {
      toast.error("Vui lòng kết nối ví owner trước");
      return;
    }
    setLoggingIn(true);
    try {
      await onLogin(signer, address);
      toast.success("Đăng nhập AI Service thành công!");
    } catch (err) {
      toast.error(err.message || "Đăng nhập thất bại");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
        <FiLock className="text-red-600 text-2xl" />
      </div>
      <div className="text-center">
        <h4 className="text-gray-900 font-bold text-lg">Xác Thực AI Service</h4>
        <p className="text-gray-500 text-sm mt-1 max-w-sm">
          Ký một thông điệp bằng <strong>ví owner</strong> để xác thực — không cần mật khẩu.
        </p>
      </div>
      <button
        onClick={handleSignIn}
        disabled={loggingIn || !isConnected}
        className="w-full max-w-sm flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50"
      >
        {loggingIn ? (
          <FiLoader className="animate-spin" size={14} />
        ) : (
          <FiLogIn size={14} />
        )}
        {loggingIn
          ? "Đang ký & xác thực..."
          : isConnected
          ? "Đăng nhập bằng ví"
          : "Hãy kết nối ví trước"}
      </button>
      <p className="text-xs text-gray-400 max-w-sm text-center">
        Chỉ ví trùng với <code className="bg-gray-100 px-1 rounded">owner</code> của hợp đồng mới đăng nhập được.
      </p>
    </div>
  );
};

// ─── Upload Zone ──────────────────────────────────────────────────────
const UploadZone = ({ token, onUploaded }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    const isSupported = file && /\.(pdf|docx)$/i.test(file.name);
    if (!isSupported) {
      toast.error("Chỉ hỗ trợ file PDF hoặc DOCX");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${AI_SERVICE_URL}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload thất bại");
      toast.success(`Upload thành công! Đã xử lý ${data.chunks_count} đoạn văn bản.`);
      onUploaded();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div
      className={`relative rounded-2xl p-8 text-center transition-all cursor-pointer
        ${dragging ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-400 hover:bg-gray-50"}`}
      style={{ border: "2px dashed" }}
      onClick={() => !uploading && fileInputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={e => e.target.files[0] && handleUpload(e.target.files[0])}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="text-red-600 text-3xl animate-spin" />
          <p className="text-gray-600 text-sm">Đang xử lý tài liệu và tạo embedding...</p>
          <p className="text-gray-400 text-xs">Có thể mất 15-30 giây</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <FiUpload className="text-red-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-700 text-sm font-medium">Kéo thả PDF / DOCX vào đây</p>
            <p className="text-gray-400 text-xs mt-1">hoặc click để chọn file (tối đa 20MB)</p>
          </div>
          <div className="flex gap-2">
            {["Luật bảo hiểm", "Nghị định 67/2023", "Quy trình BT"].map(t => (
              <span key={t} className="text-[10px] px-2 py-1 bg-gray-100 border border-gray-200 rounded-full text-gray-400">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Document List ─────────────────────────────────────────────────────
const DocumentList = ({ documents, token, onDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (doc) => {
    if (!confirm(`Xóa tài liệu "${doc.original_name}"?`)) return;
    setDeletingId(doc.id);
    try {
      const res = await fetch(`${AI_SERVICE_URL}/documents/${doc.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xóa thất bại");
      toast.success(`Đã xóa "${doc.original_name}"`);
      onDeleted();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FiFileText size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Chưa có tài liệu nào. Upload PDF/DOCX để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div
          key={doc.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
        >
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <FiFileText className="text-red-600" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-sm font-medium truncate">{doc.original_name}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {doc.chunks_count} đoạn
              {doc.size_kb ? ` · ${doc.size_kb} KB` : ""}
              {doc.uploaded_at ? ` · ${new Date(doc.uploaded_at).toLocaleDateString("vi-VN")}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] px-2 py-0.5 bg-green-50 border border-green-200 text-green-600 rounded-full">
              Hoạt động
            </span>
            <button
              onClick={() => handleDelete(doc)}
              disabled={deletingId === doc.id}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
            >
              {deletingId === doc.id
                ? <FiLoader size={14} className="animate-spin" />
                : <FiTrash2 size={14} />
              }
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
export default function DocumentManagement() {
  const { token, checking, loginWithWallet, logout } = useAiAuth();
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [stats, setStats] = useState({ total_chunks: 0 });

  useEffect(() => {
    if (token) fetchDocuments();
  }, [token]);

  const fetchDocuments = async () => {
    if (!token) return;
    setLoadingDocs(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        fetch(`${AI_SERVICE_URL}/documents/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${AI_SERVICE_URL}/documents/stats/public`),
      ]);

      if (docsRes.status === 401 || docsRes.status === 403) {
        logout();
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const docsData = await docsRes.json();
      const statsData = await statsRes.json();
      setDocuments(docsData.documents || []);
      setStats(statsData);
    } catch {
      toast.error("Không thể tải danh sách tài liệu");
    } finally {
      setLoadingDocs(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 gap-3">
        <FiLoader className="animate-spin" size={18} />
        <span className="text-sm">Đang kiểm tra phiên đăng nhập...</span>
      </div>
    );
  }

  if (!token) {
    return <WalletLoginForm onLogin={loginWithWallet} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 font-semibold">Quản Lý Tài Liệu AI</h3>
          <p className="text-gray-500 text-sm mt-0.5">
            {documents.length} tài liệu · {stats.total_chunks} đoạn văn bản trong ChromaDB
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDocuments}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <FiRefreshCw size={16} className={loadingDocs ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => { logout(); toast("Đã đăng xuất khỏi AI Service"); }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Đăng xuất"
          >
            <FiLock size={16} />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
          ${stats.total_chunks > 0
            ? "bg-green-50 border border-green-200 text-green-600"
            : "bg-yellow-50 border border-yellow-200 text-amber-700"
          }`}
      >
        {stats.total_chunks > 0 ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
        {stats.total_chunks > 0
          ? `AI đang hoạt động với ${stats.total_chunks} đoạn văn bản từ ${documents.length} tài liệu`
          : "Chưa có tài liệu — Upload PDF/DOCX để chatbot có thể trả lời"
        }
      </div>

      {/* Upload Zone */}
      <UploadZone token={token} onUploaded={fetchDocuments} />

      {/* Document List */}
      <div>
        <h4 className="text-gray-500 text-xs uppercase tracking-wider mb-3">
          Tài liệu đã upload ({documents.length})
        </h4>
        {loadingDocs ? (
          <div className="text-center py-6 text-gray-300">
            <FiLoader size={20} className="animate-spin mx-auto" />
          </div>
        ) : (
          <DocumentList documents={documents} token={token} onDeleted={fetchDocuments} />
        )}
      </div>
    </div>
  );
}
