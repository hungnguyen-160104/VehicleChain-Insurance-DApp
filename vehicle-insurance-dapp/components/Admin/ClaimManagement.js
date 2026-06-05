import { useState, useEffect } from "react";
import { useEthersProvider, useEthersSigner } from "../../provider/hooks";
import {
  contractService,
  CLAIM_STATUS,
  CLAIM_STATUS_LABELS,
  INSURANCE_TYPE_LABELS,
} from "../../services/contract";
import {
  FiFileText,
  FiCheck,
  FiX,
  FiClock,
  FiDollarSign,
  FiFilter,
  FiRefreshCw,
  FiActivity,
  FiZap,
  FiTruck,
  FiAlertCircle,
  FiEye,
  FiExternalLink,
  FiImage,
  FiDownload,
  FiMaximize2,
  FiSearch,
} from "react-icons/fi";
import toast from "react-hot-toast";

// ─── IPFS Document Viewer Modal ────────────────────────────────────────────
const IpfsViewerModal = ({ hash, onClose }) => {
  const [loadState, setLoadState] = useState("loading"); // loading | image | pdf | error
  const [fullscreen, setFullscreen] = useState(false);

  const getGatewayUrl = (raw) => {
    if (!raw) return null;
    if (raw.startsWith("http")) return raw;
    const cid = raw.replace("ipfs://", "");
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  };

  const url = getGatewayUrl(hash);

  useEffect(() => {
    if (!url) { setLoadState("error"); return; }

    // Thử detect loại file qua Content-Type
    fetch(url, { method: "HEAD" })
      .then((res) => {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("pdf")) setLoadState("pdf");
        else if (ct.includes("image")) setLoadState("image");
        else setLoadState("pdf"); // mặc định dùng iframe
      })
      .catch(() => setLoadState("pdf")); // nếu HEAD bị CORS, cứ dùng iframe
  }, [url]);

  const handleDownload = () => {
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`relative bg-white border border-gray-100 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
          fullscreen ? "w-full h-full rounded-none" : "w-full max-w-4xl h-[80vh]"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <FiFileText className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Tài Liệu Bồi Thường</h3>
              <p className="text-xs text-gray-400 font-mono truncate max-w-xs">
                {hash?.slice(0, 20)}...{hash?.slice(-8)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Fullscreen toggle */}
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all"
              title="Toàn màn hình"
            >
              <FiMaximize2 className="h-4 w-4" />
            </button>

            {/* Open in new tab */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all"
              title="Mở tab mới"
            >
              <FiExternalLink className="h-4 w-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all"
              title="Đóng"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden relative">
          {loadState === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Đang tải từ IPFS...</p>
              <p className="text-gray-400 text-xs">gateway.pinata.cloud</p>
            </div>
          )}

          {loadState === "image" && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-gray-50">
              <img
                src={url}
                alt="IPFS Document"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                onError={() => setLoadState("error")}
              />
            </div>
          )}

          {loadState === "pdf" && (
            <iframe
              src={url}
              className="w-full h-full border-0 rounded-b-2xl"
              title="IPFS Document"
              onLoad={() => {}}
              onError={() => setLoadState("error")}
            />
          )}

          {loadState === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <FiAlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-gray-900 font-bold">Không thể tải tài liệu</p>
              <p className="text-gray-500 text-sm text-center max-w-sm">
                File có thể chưa được pin hoặc gateway không phản hồi.
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                <FiExternalLink className="w-4 h-4 mr-2" />
                Thử mở trong tab mới
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-gray-400">
            Lưu trữ phi tập trung IPFS via Pinata Gateway
          </p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-xs font-semibold transition-all"
          >
            <FiDownload className="w-3 h-3 mr-1.5" />
            Tải xuống
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const ClaimManagement = ({ isOwner = false, isGarage = false }) => {
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [allClaims, setAllClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingClaim, setProcessingClaim] = useState(null);
  const [claimActions, setClaimActions] = useState({});
  // Garage input state: { [claimId]: { tenGarage, lyDo } }
  const [garageInputs, setGarageInputs] = useState({});

  // IPFS viewer state
  const [ipfsModal, setIpfsModal] = useState({ open: false, hash: null });

  useEffect(() => {
    if (provider) fetchClaims();
  }, [provider]);

  const fetchClaims = async () => {
    if (!provider) return;
    setLoading(true);
    try {
      const result = await contractService.fetchAllClaims(provider);
      if (result && result.success) {
        setAllClaims(result.claims || []);
      } else if (Array.isArray(result)) {
        setAllClaims(result);
      } else {
        toast.error("Không thể tải danh sách yêu cầu bồi thường");
      }
    } catch (error) {
      console.error("Lỗi khi tải yêu cầu bồi thường:", error);
      toast.error("Lỗi khi tải dữ liệu yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClaims();
    setRefreshing(false);
    toast.success("Đã làm mới danh sách yêu cầu!");
  };

  const handleDuyetClaim = async (claimId) => {
    const action = claimActions[claimId] || {};
    const amount = action.approvedAmount;
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Vui lòng nhập số tiền bồi thường hợp lệ");
      return;
    }
    try {
      setProcessingClaim(claimId);
      const result = await contractService.adminXuLyClaim(claimId, true, amount, "", signer);
      if (result && result.success) {
        toast.success(`Đã duyệt yêu cầu #${claimId} thành công!`);
        setClaimActions((prev) => ({ ...prev, [claimId]: {} }));
        await fetchClaims();
      } else {
        toast.error(result?.error || "Không thể duyệt yêu cầu");
      }
    } catch (error) {
      toast.error("Lỗi khi duyệt yêu cầu bồi thường");
    } finally {
      setProcessingClaim(null);
    }
  };

  const handleTuChoiClaim = async (claimId) => {
    const action = claimActions[claimId] || {};
    const lyDo = action.lyDo || "";
    if (!lyDo.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      setProcessingClaim(claimId);
      const result = await contractService.adminXuLyClaim(claimId, false, 0, lyDo, signer);
      if (result && result.success) {
        toast.success(`Đã từ chối yêu cầu #${claimId}`);
        setClaimActions((prev) => ({ ...prev, [claimId]: {} }));
        await fetchClaims();
      } else {
        toast.error(result?.error || "Không thể từ chối yêu cầu");
      }
    } catch (error) {
      toast.error("Lỗi khi từ chối yêu cầu bồi thường");
    } finally {
      setProcessingClaim(null);
    }
  };

  const handleChiTra = async (claimId) => {
    try {
      setProcessingClaim(claimId);
      const result = await contractService.chiTraBoiThuong(claimId, signer);
      if (result && result.success) {
        toast.success(`Đã chi trả bồi thường cho yêu cầu #${claimId}!`);
        await fetchClaims();
      } else {
        toast.error(result?.error || "Không thể chi trả bồi thường");
      }
    } catch (error) {
      toast.error("Lỗi khi chi trả bồi thường");
    } finally {
      setProcessingClaim(null);
    }
  };

  const updateClaimAction = (claimId, field, value) => {
    setClaimActions((prev) => ({
      ...prev,
      [claimId]: { ...(prev[claimId] || {}), [field]: value },
    }));
  };

  const updateGarageInput = (claimId, field, value) => {
    setGarageInputs((prev) => ({
      ...prev,
      [claimId]: { ...(prev[claimId] || {}), [field]: value },
    }));
  };

  // Garage: cập nhật trạng thái giám định (PENDING→DANG_GIAM_DINH hoặc DANG_GIAM_DINH→CHO_HO_SO)
  const handleGarageAdvance = async (claimId, currentStatus) => {
    const input = garageInputs[claimId] || {};
    if (!input.tenGarage?.trim()) {
      toast.error("Vui lòng nhập tên garage");
      return;
    }
    const nextStatus =
      currentStatus === CLAIM_STATUS.PENDING
        ? CLAIM_STATUS.DANG_GIAM_DINH
        : CLAIM_STATUS.CHO_HO_SO;
    try {
      setProcessingClaim(claimId);
      const result = await contractService.garageCapNhatTrangThai(
        claimId,
        nextStatus,
        input.tenGarage.trim(),
        input.lyDo?.trim() || "",
        signer
      );
      if (result && result.success) {
        toast.success("Cập nhật trạng thái giám định thành công!");
        setGarageInputs((prev) => ({ ...prev, [claimId]: {} }));
        await fetchClaims();
      } else {
        toast.error(result?.error || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái giám định");
    } finally {
      setProcessingClaim(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      [CLAIM_STATUS.PENDING]: "bg-yellow-50 text-yellow-700 border-yellow-200",
      [CLAIM_STATUS.DANG_GIAM_DINH]: "bg-orange-50 text-orange-400 border-orange-200",
      [CLAIM_STATUS.CHO_HO_SO]: "bg-red-50 text-red-400 border-red-200",
      [CLAIM_STATUS.DANG_THAM_DINH]: "bg-red-50 text-red-400 border-red-200",
      [CLAIM_STATUS.APPROVED]: "bg-emerald-50 text-emerald-400 border-emerald-500/25",
      [CLAIM_STATUS.REJECTED]: "bg-red-50 text-red-400 border-red-200",
      [CLAIM_STATUS.PAID]: "bg-orange-50 text-orange-400 border-orange-200",
    };
    return colors[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Admin có thể xử lý bất kỳ claim nào chưa kết thúc
  const isAdminActionable = (status) =>
    status !== CLAIM_STATUS.APPROVED &&
    status !== CLAIM_STATUS.REJECTED &&
    status !== CLAIM_STATUS.PAID;

  // Garage chỉ xử lý PENDING và DANG_GIAM_DINH
  const isGarageActionable = (status) =>
    status === CLAIM_STATUS.PENDING || status === CLAIM_STATUS.DANG_GIAM_DINH;

  const filterOptions = [
    { value: "all", label: "Tất Cả" },
    { value: String(CLAIM_STATUS.PENDING), label: CLAIM_STATUS_LABELS[CLAIM_STATUS.PENDING] },
    { value: String(CLAIM_STATUS.DANG_GIAM_DINH), label: CLAIM_STATUS_LABELS[CLAIM_STATUS.DANG_GIAM_DINH] },
    { value: String(CLAIM_STATUS.CHO_HO_SO), label: CLAIM_STATUS_LABELS[CLAIM_STATUS.CHO_HO_SO] },
    { value: String(CLAIM_STATUS.DANG_THAM_DINH), label: CLAIM_STATUS_LABELS[CLAIM_STATUS.DANG_THAM_DINH] },
    { value: String(CLAIM_STATUS.APPROVED), label: CLAIM_STATUS_LABELS[CLAIM_STATUS.APPROVED] },
    { value: String(CLAIM_STATUS.REJECTED), label: CLAIM_STATUS_LABELS[CLAIM_STATUS.REJECTED] },
    { value: String(CLAIM_STATUS.PAID), label: CLAIM_STATUS_LABELS[CLAIM_STATUS.PAID] },
  ];

  const filteredClaims = allClaims.filter((claim) => {
    const matchStatus = statusFilter === "all" || String(claim.status) === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      String(claim.claimId).includes(q) ||
      (claim.vehicleBienSo || "").toLowerCase().includes(q) ||
      (claim.claimant || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalClaims = allClaims.length;
  const pendingCount = allClaims.filter(
    (c) =>
      c.status === CLAIM_STATUS.PENDING ||
      c.status === CLAIM_STATUS.DANG_GIAM_DINH ||
      c.status === CLAIM_STATUS.CHO_HO_SO ||
      c.status === CLAIM_STATUS.DANG_THAM_DINH
  ).length;
  const approvedCount = allClaims.filter((c) => c.status === CLAIM_STATUS.APPROVED).length;
  const paidCount = allClaims.filter((c) => c.status === CLAIM_STATUS.PAID).length;

  return (
    <>
      {/* IPFS Viewer Modal */}
      {ipfsModal.open && ipfsModal.hash && (
        <IpfsViewerModal
          hash={ipfsModal.hash}
          onClose={() => setIpfsModal({ open: false, hash: null })}
        />
      )}

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản Lý Yêu Cầu Bồi Thường</h2>
            <p className="text-gray-500">Xem xét và xử lý yêu cầu bồi thường bảo hiểm xe</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="group inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-100 hover:shadow transition-all duration-300 disabled:opacity-50"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : "group-hover:scale-110"} transition-transform`}
            />
            Làm Mới
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: FiFileText, title: "Tổng Yêu Cầu", value: totalClaims, bg: "bg-purple-50", text: "text-purple-600" },
            { icon: FiClock, title: "Đang Chờ", value: pendingCount, bg: "bg-yellow-50", text: "text-yellow-600" },
            { icon: FiCheck, title: "Đã Duyệt", value: approvedCount, bg: "bg-emerald-50", text: "text-emerald-600" },
            { icon: FiDollarSign, title: "Đã Chi Trả", value: paidCount, bg: "bg-red-50", text: "text-red-600" },
          ].map((stat, index) => (
            <div key={index} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 ${stat.text}`} />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">{stat.title}</div>
                  <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <div className="flex items-center space-x-4 flex-wrap gap-y-3">
            {/* Filter icon */}
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <FiFilter className="h-5 w-5 text-purple-600" />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block pl-3 pr-10 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 rounded-xl shadow-sm transition-all duration-200"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo claim ID, biển số, địa chỉ ví..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 text-sm text-gray-800 transition-all duration-200"
              />
            </div>

            <span className="text-sm font-medium text-gray-500 flex-shrink-0">
              {filteredClaims.length} / {totalClaims} yêu cầu
            </span>
          </div>
        </div>

        {/* Claims List */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <div>
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <FiActivity className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Danh Sách Yêu Cầu Bồi Thường</h3>
              </div>
            </div>

            {loading ? (
              <div className="p-8">
                <div className="animate-pulse space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border border-gray-100 rounded-2xl p-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 w-24 bg-gray-100 rounded-xl"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
                  <FiFileText className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không có yêu cầu nào</h3>
                <p className="text-gray-500">
                  {statusFilter !== "all" || searchQuery
                    ? "Không tìm thấy yêu cầu phù hợp với bộ lọc."
                    : "Chưa có yêu cầu bồi thường nào được nộp."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredClaims.map((claim, index) => {
                  const action = claimActions[claim.claimId] || {};
                  const garageInput = garageInputs[claim.claimId] || {};
                  const isProcessing = processingClaim === claim.claimId;
                  const showAdminForm = isOwner && isAdminActionable(claim.status);
                  const showGarageForm = isGarage && !isOwner && isGarageActionable(claim.status);
                  const hasIpfs = !!(claim.ipfsDocuments || claim.ipfsHash);

                  return (
                    <div
                      key={claim.claimId}
                      className="p-8 hover:bg-gray-50 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Claim Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-red-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                            <FiTruck className="h-7 w-7" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">
                              Yêu Cầu #{String(claim.claimId)}
                            </h4>
                            <p className="text-gray-700 font-semibold mb-1">
                              {claim.vehicleBienSo || claim.bienSo || "Biển số: N/A"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {INSURANCE_TYPE_LABELS[claim.insuranceType] ||
                                INSURANCE_TYPE_LABELS[claim.loaiBaoHiem] ||
                                "Bảo hiểm xe"}{" "}
                              • {claim.tenGarage || claim.garage || "Chưa có garage"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            {claim.claimAmount || claim.soTienYeuCau || "0"} ETH
                          </div>
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(claim.status)}`}
                          >
                            {CLAIM_STATUS_LABELS[claim.status] || "Không xác định"}
                          </span>
                        </div>
                      </div>

                      {/* Claim Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="text-gray-400 font-medium block mb-1 text-xs uppercase tracking-wide">Người Yêu Cầu</span>
                          <div className="font-mono font-bold text-gray-900 text-sm">
                            {formatAddress(claim.claimant || claim.nguoiYeuCau)}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="text-gray-400 font-medium block mb-1 text-xs uppercase tracking-wide">Số Tiền Yêu Cầu</span>
                          <div className="font-bold text-gray-900">
                            {claim.claimAmount || claim.soTienYeuCau || "0"} ETH
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="text-gray-400 font-medium block mb-1 text-xs uppercase tracking-wide">Ngày Nộp</span>
                          <div className="font-bold text-gray-900 text-sm">
                            {claim.submissionDate
                              ? new Date(claim.submissionDate).toLocaleDateString("vi-VN")
                              : "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {claim.description && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Mô tả sự cố</p>
                          <p className="text-sm text-gray-700 font-medium">{claim.description}</p>
                        </div>
                      )}

                      {/* ─── IPFS Document Viewer ─────────────────────── */}
                      {hasIpfs && (
                        <div className="mb-6">
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tài Liệu Đính Kèm</p>
                          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                            {/* Nút xem trong trang */}
                            <button
                              onClick={() =>
                                setIpfsModal({
                                  open: true,
                                  hash: claim.ipfsDocuments || claim.ipfsHash,
                                })
                              }
                              className="group inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              <FiEye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              Xem Tài Liệu
                            </button>

                            {/* Nút mở tab mới */}
                            <button
                              onClick={() => {
                                const hash = claim.ipfsDocuments || claim.ipfsHash;
                                const url = hash?.startsWith("http")
                                  ? hash
                                  : `https://gateway.pinata.cloud/ipfs/${hash?.replace("ipfs://", "")}`;
                                window.open(url, "_blank");
                              }}
                              className="group inline-flex items-center px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all duration-200"
                            >
                              <FiExternalLink className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              Mở Tab Mới
                            </button>

                            {/* IPFS hash preview */}
                            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                              <FiImage className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs font-mono text-gray-400">
                                {(claim.ipfsDocuments || claim.ipfsHash || "").slice(0, 16)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Chi Trả: Admin + claim đã duyệt ── */}
                      {isOwner && claim.status === CLAIM_STATUS.APPROVED && (
                        <div className="flex space-x-4 mb-4">
                          <button
                            onClick={() => handleChiTra(claim.claimId)}
                            disabled={isProcessing}
                            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                          >
                            <FiDollarSign className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            {isProcessing ? "Đang Xử Lý..." : "Chi Trả Bồi Thường"}
                          </button>
                        </div>
                      )}

                      {/* ── GARAGE: form cập nhật giám định ── */}
                      {showGarageForm && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <FiTruck className="h-5 w-5 text-emerald-600" />
                            <h5 className="font-bold text-gray-900">
                              {claim.status === CLAIM_STATUS.PENDING
                                ? "Bắt Đầu Giám Định"
                                : "Hoàn Thành Giám Định — Chờ Hồ Sơ"}
                            </h5>
                          </div>
                          <p className="text-xs text-emerald-700">
                            {claim.status === CLAIM_STATUS.PENDING
                              ? "Xác nhận tiếp nhận và bắt đầu quá trình giám định xe"
                              : "Giám định hoàn tất, yêu cầu khách nộp hồ sơ giấy tờ bổ sung"}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tên Garage <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="VD: Garage Hoàng Long"
                                value={garageInput.tenGarage || ""}
                                onChange={(e) => updateGarageInput(claim.claimId, "tenGarage", e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-gray-900 font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Ghi Chú</label>
                              <input
                                type="text"
                                placeholder="Ghi chú kết quả giám định..."
                                value={garageInput.lyDo || ""}
                                onChange={(e) => updateGarageInput(claim.claimId, "lyDo", e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-gray-900 font-medium"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleGarageAdvance(claim.claimId, claim.status)}
                            disabled={isProcessing || !garageInput.tenGarage?.trim()}
                            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                          >
                            <FiCheck className="w-4 h-4 mr-2" />
                            {isProcessing
                              ? "Đang Xử Lý..."
                              : claim.status === CLAIM_STATUS.PENDING
                              ? "Bắt Đầu Giám Định"
                              : "Xác Nhận Chờ Hồ Sơ"}
                          </button>
                        </div>
                      )}

                      {/* ── ADMIN: form duyệt/từ chối ── */}
                      {showAdminForm && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiAlertCircle className="h-5 w-5 text-amber-600" />
                            <h5 className="font-bold text-gray-900">
                              Xử Lý Yêu Cầu #{String(claim.claimId)}
                              <span className="ml-2 text-xs font-normal text-amber-600">
                                (Trạng thái hiện tại: {CLAIM_STATUS_LABELS[claim.status]})
                              </span>
                            </h5>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Số Tiền Duyệt (ETH)</label>
                              <input
                                type="number"
                                step="0.0001"
                                min="0"
                                placeholder="Nhập số tiền bồi thường"
                                value={action.approvedAmount || ""}
                                onChange={(e) => updateClaimAction(claim.claimId, "approvedAmount", e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-gray-900 font-medium transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Lý Do Từ Chối</label>
                              <input
                                type="text"
                                placeholder="Nhập lý do nếu từ chối"
                                value={action.lyDo || ""}
                                onChange={(e) => updateClaimAction(claim.claimId, "lyDo", e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 text-gray-900 font-medium transition-all duration-200"
                              />
                            </div>
                          </div>

                          <div className="flex space-x-3 pt-2">
                            <button
                              onClick={() => handleDuyetClaim(claim.claimId)}
                              disabled={isProcessing || !action.approvedAmount || parseFloat(action.approvedAmount) <= 0}
                              className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                            >
                              <FiCheck className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              {isProcessing ? "Đang Xử Lý..." : "Duyệt Bồi Thường"}
                            </button>

                            <button
                              onClick={() => handleTuChoiClaim(claim.claimId)}
                              disabled={isProcessing || !action.lyDo?.trim()}
                              className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                            >
                              <FiX className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              {isProcessing ? "Đang Xử Lý..." : "Từ Chối"}
                            </button>
                          </div>
                        </div>
                      )}

                      {isProcessing && (
                        <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 text-red-400 rounded-xl border border-red-200">
                          <FiZap className="h-4 w-4 animate-pulse" />
                          <span className="text-sm font-semibold">Đang xử lý giao dịch blockchain...</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClaimManagement;
