import { useState, useEffect, useRef } from "react";
import {
  FiUpload, FiTrash2, FiFileText, FiLock, FiUnlock,
  FiRefreshCw, FiAlertCircle, FiCheckCircle, FiLoader
} from "react-icons/fi";
import toast from "react-hot-toast";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

// ─── Login Panel ──────────────────────────────────────────────────────
const LoginPanel = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${AI_SERVICE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Đăng nhập thất bại");
      localStorage.setItem("ai_admin_token", data.access_token);
      onLogin(data.access_token);
      toast.success("Đăng nhập thành công!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(200,16,46,0.2)",
          backdropFilter: "blur(20px)"
        }}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center mx-auto mb-3">
            <FiLock className="text-white text-xl" />
          </div>
          <h3 className="text-white font-semibold text-lg">Đăng nhập AI Admin</h3>
          <p className="text-white/40 text-sm mt-1">Xác thực để quản lý tài liệu AI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider mb-1.5 block">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-red-500/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider mb-1.5 block">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-red-500/60 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2">
              <FiAlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Upload Zone ──────────────────────────────────────────────────────
const UploadZone = ({ token, onUploaded }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Chỉ hỗ trợ file PDF");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${AI_SERVICE_URL}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
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
        ${dragging ? "border-red-500 bg-red-900/20" : "border-white/10 hover:border-red-500/40 hover:bg-white/5"}`}
      style={{ border: "2px dashed" }}
      onClick={() => !uploading && fileInputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => e.target.files[0] && handleUpload(e.target.files[0])}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="text-red-400 text-3xl animate-spin" />
          <p className="text-white/70 text-sm">Đang xử lý PDF và tạo embedding...</p>
          <p className="text-white/40 text-xs">Có thể mất 15-30 giây</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-900/40 flex items-center justify-center">
            <FiUpload className="text-red-400 text-xl" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Kéo thả PDF vào đây</p>
            <p className="text-white/40 text-xs mt-1">hoặc click để chọn file (tối đa 20MB)</p>
          </div>
          <div className="flex gap-2">
            {["Luật bảo hiểm", "Nghị định 67/2023", "Quy trình BT"].map(t => (
              <span key={t} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-full text-white/40">{t}</span>
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
        headers: { Authorization: `Bearer ${token}` }
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
      <div className="text-center py-8 text-white/30">
        <FiFileText size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Chưa có tài liệu nào. Upload PDF để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div
          key={doc.id}
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="w-9 h-9 rounded-lg bg-red-900/40 flex items-center justify-center flex-shrink-0">
            <FiFileText className="text-red-400" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/90 text-sm font-medium truncate">{doc.original_name}</p>
            <p className="text-white/30 text-xs mt-0.5">
              {doc.chunks_count} đoạn · {doc.size_kb} KB · {new Date(doc.uploaded_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] px-2 py-0.5 bg-green-900/40 border border-green-700/30 text-green-400 rounded-full">
              Hoạt động
            </span>
            <button
              onClick={() => handleDelete(doc)}
              disabled={deletingId === doc.id}
              className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all disabled:opacity-30"
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
  const [token, setToken] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [stats, setStats] = useState({ total_chunks: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("ai_admin_token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) fetchDocuments();
  }, [token]);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        fetch(`${AI_SERVICE_URL}/documents/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${AI_SERVICE_URL}/documents/stats/public`)
      ]);
      if (docsRes.status === 401) { setToken(null); localStorage.removeItem("ai_admin_token"); return; }
      const docsData = await docsRes.json();
      const statsData = await statsRes.json();
      setDocuments(docsData.documents || []);
      setStats(statsData);
    } catch (err) {
      toast.error("Không thể tải danh sách tài liệu");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ai_admin_token");
    setToken(null);
    setDocuments([]);
  };

  if (!token) {
    return <LoginPanel onLogin={setToken} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Quản Lý Tài Liệu AI</h3>
          <p className="text-white/40 text-sm mt-0.5">
            {documents.length} tài liệu · {stats.total_chunks} đoạn văn bản trong ChromaDB
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDocuments}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <FiRefreshCw size={16} className={loadingDocs ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white/40 hover:text-white border border-white/10 hover:border-white/20 rounded-lg text-xs transition-all"
          >
            <FiUnlock size={12} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
          ${stats.total_chunks > 0
            ? "bg-green-900/20 border border-green-700/30 text-green-400"
            : "bg-yellow-900/20 border border-yellow-700/30 text-yellow-400"
          }`}
      >
        {stats.total_chunks > 0 ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
        {stats.total_chunks > 0
          ? `AI đang hoạt động với ${stats.total_chunks} đoạn văn bản từ ${documents.length} tài liệu`
          : "Chưa có tài liệu — Upload PDF để chatbot có thể trả lời"
        }
      </div>

      {/* Upload Zone */}
      <UploadZone token={token} onUploaded={fetchDocuments} />

      {/* Document List */}
      <div>
        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">
          Tài liệu đã upload ({documents.length})
        </h4>
        {loadingDocs ? (
          <div className="text-center py-6 text-white/30">
            <FiLoader size={20} className="animate-spin mx-auto" />
          </div>
        ) : (
          <DocumentList documents={documents} token={token} onDeleted={fetchDocuments} />
        )}
      </div>
    </div>
  );
}
