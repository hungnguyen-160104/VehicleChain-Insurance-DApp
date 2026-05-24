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
} from "react-icons/fi";
import toast from "react-hot-toast";

const ClaimManagement = () => {
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [allClaims, setAllClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingClaim, setProcessingClaim] = useState(null);

  // Per-claim action state
  const [claimActions, setClaimActions] = useState({});

  useEffect(() => {
    if (provider) {
      fetchClaims();
    }
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
      const result = await contractService.adminXuLyClaim(
        claimId,
        true,
        amount,
        "",
        signer
      );

      if (result && result.success) {
        toast.success(`Đã duyệt yêu cầu #${claimId} thành công!`);
        setClaimActions((prev) => ({ ...prev, [claimId]: {} }));
        await fetchClaims();
      } else {
        toast.error(result?.error || "Không thể duyệt yêu cầu");
      }
    } catch (error) {
      console.error("Lỗi khi duyệt yêu cầu:", error);
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
      const result = await contractService.adminXuLyClaim(
        claimId,
        false,
        0,
        lyDo,
        signer
      );

      if (result && result.success) {
        toast.success(`Đã từ chối yêu cầu #${claimId}`);
        setClaimActions((prev) => ({ ...prev, [claimId]: {} }));
        await fetchClaims();
      } else {
        toast.error(result?.error || "Không thể từ chối yêu cầu");
      }
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu:", error);
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
      console.error("Lỗi khi chi trả:", error);
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

  const getStatusColor = (status) => {
    const colors = {
      [CLAIM_STATUS.PENDING]:
        "bg-yellow-50 text-yellow-700 border-yellow-200",
      [CLAIM_STATUS.DANG_GIAM_DINH]:
        "bg-orange-50 text-orange-400 border-orange-200",
      [CLAIM_STATUS.CHO_HO_SO]:
        "bg-red-50 text-red-400 border-red-200",
      [CLAIM_STATUS.DANG_THAM_DINH]:
        "bg-red-50 text-red-400 border-red-200",
      [CLAIM_STATUS.APPROVED]:
        "bg-emerald-50 text-emerald-400 border-emerald-500/25",
      [CLAIM_STATUS.REJECTED]:
        "bg-red-50 text-red-400 border-red-200",
      [CLAIM_STATUS.PAID]:
        "bg-orange-50 text-orange-400 border-orange-200",
    };
    return (
      colors[status] ||
      "bg-white/5 text-white/80 border-white/12"
    );
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActionable = (status) =>
    status === CLAIM_STATUS.CHO_HO_SO ||
    status === CLAIM_STATUS.DANG_THAM_DINH;

  // Filter
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
    if (statusFilter === "all") return true;
    return String(claim.status) === statusFilter;
  });

  // Statistics
  const totalClaims = allClaims.length;
  const pendingCount = allClaims.filter(
    (c) =>
      c.status === CLAIM_STATUS.PENDING ||
      c.status === CLAIM_STATUS.DANG_GIAM_DINH ||
      c.status === CLAIM_STATUS.CHO_HO_SO ||
      c.status === CLAIM_STATUS.DANG_THAM_DINH
  ).length;
  const approvedCount = allClaims.filter(
    (c) => c.status === CLAIM_STATUS.APPROVED
  ).length;
  const paidCount = allClaims.filter(
    (c) => c.status === CLAIM_STATUS.PAID
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản Lý Yêu Cầu Bồi Thường</h2>
          <p className="text-white/60">Xem xét và xử lý yêu cầu bồi thường bảo hiểm xe</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="group inline-flex items-center px-4 py-2 bg-white/8 backdrop-blur-xl border border-white/12 shadow-lg text-sm font-medium rounded-xl text-white/80 hover:bg-white/8 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          <FiRefreshCw
            className={`w-4 h-4 mr-2 ${
              refreshing ? "animate-spin" : "group-hover:scale-110"
            } transition-transform`}
          />
          Làm Mới
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            icon: FiFileText,
            title: "Tổng Yêu Cầu",
            value: totalClaims,
            bg: "from-purple-100 to-pink-100",
            text: "text-purple-400",
            glow: "from-purple-500/10 to-pink-500/10",
          },
          {
            icon: FiClock,
            title: "Đang Chờ",
            value: pendingCount,
            bg: "from-yellow-100 to-orange-100",
            text: "text-yellow-400",
            glow: "from-yellow-500/10 to-orange-500/10",
          },
          {
            icon: FiCheck,
            title: "Đã Duyệt",
            value: approvedCount,
            bg: "from-emerald-100 to-green-100",
            text: "text-emerald-400",
            glow: "from-emerald-500/10 to-green-500/10",
          },
          {
            icon: FiDollarSign,
            title: "Đã Chi Trả",
            value: paidCount,
            bg: "from-red-900/40 to-orange-900/30",
            text: "text-red-400",
            glow: "from-red-600/10 to-orange-500/10",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-6 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.glow} rounded-full blur-xl opacity-50`}
              ></div>
            </div>
            <div className="relative flex items-center">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`h-6 w-6 ${stat.text}`} />
              </div>
              <div className="ml-4">
                <div className="text-sm font-bold text-white/60">{stat.title}</div>
                <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-6">
        <div className="flex items-center space-x-4 flex-wrap gap-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <FiFilter className="h-5 w-5 text-purple-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block pl-3 pr-10 py-2 text-base bg-white/5 backdrop-blur-sm border border-white/12 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 rounded-xl shadow-sm transition-all duration-300"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-sm font-medium text-white/60">
            Hiển thị {filteredClaims.length} yêu cầu
          </span>
        </div>
      </div>

      {/* Claims List */}
      <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-600/5 to-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative">
          <div className="px-8 py-6 border-b border-white/12">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <FiActivity className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Danh Sách Yêu Cầu Bồi Thường
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-white/12 rounded-2xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-r from-white/10 to-white/15 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gradient-to-r from-white/10 to-white/15 rounded w-1/4"></div>
                        <div className="h-3 bg-gradient-to-r from-white/10 to-white/15 rounded w-1/2"></div>
                      </div>
                      <div className="h-8 w-24 bg-gradient-to-r from-white/10 to-white/15 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                <FiFileText className="h-10 w-10 text-white/40" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Không có yêu cầu nào
              </h3>
              <p className="text-white/60">
                {statusFilter !== "all"
                  ? "Không có yêu cầu nào với trạng thái đã chọn."
                  : "Chưa có yêu cầu bồi thường nào được nộp."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/50">
              {filteredClaims.map((claim, index) => {
                const action = claimActions[claim.claimId] || {};
                const isProcessing = processingClaim === claim.claimId;
                const showActionForm = isActionable(claim.status);

                return (
                  <div
                    key={claim.claimId}
                    className="p-8 hover:bg-white/30 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Claim Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-red-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                          <FiTruck className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white mb-1">
                            Yêu Cầu #{String(claim.claimId)}
                          </h4>
                          <p className="text-white/80 font-semibold mb-1">
                            {claim.vehicleBienSo || claim.bienSo || "Biển số: N/A"}
                          </p>
                          <p className="text-sm text-white/50">
                            {INSURANCE_TYPE_LABELS[claim.insuranceType] ||
                              INSURANCE_TYPE_LABELS[claim.loaiBaoHiem] ||
                              "Bảo hiểm xe"}{" "}
                            •{" "}
                            {claim.tenGarage || claim.garage || "Chưa có garage"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-white mb-2">
                          {claim.claimAmount || claim.soTienYeuCau || "0"} ETH
                        </div>
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(
                            claim.status
                          )}`}
                        >
                          {CLAIM_STATUS_LABELS[claim.status] || "Không xác định"}
                        </span>
                      </div>
                    </div>

                    {/* Claim Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/12">
                        <span className="text-white/50 font-medium block mb-1 text-xs uppercase tracking-wide">
                          Người Yêu Cầu
                        </span>
                        <div className="font-mono font-bold text-white text-sm">
                          {formatAddress(claim.claimant || claim.nguoiYeuCau)}
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/12">
                        <span className="text-white/50 font-medium block mb-1 text-xs uppercase tracking-wide">
                          Số Tiền Yêu Cầu
                        </span>
                        <div className="font-bold text-white">
                          {claim.claimAmount || claim.soTienYeuCau || "0"} ETH
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/12">
                        <span className="text-white/50 font-medium block mb-1 text-xs uppercase tracking-wide">
                          Garage Giám Định
                        </span>
                        <div className="font-bold text-white text-sm">
                          {claim.tenGarage || claim.garage
                            ? formatAddress(claim.tenGarage || claim.garage)
                            : "Chưa phân công"}
                        </div>
                      </div>
                    </div>

                    {/* IPFS Documents */}
                    {(claim.ipfsDocuments || claim.ipfsHash) && (
                      <div className="mb-6">
                        <button
                          onClick={() =>
                            window.open(
                              `https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments || claim.ipfsHash}`,
                              "_blank"
                            )
                          }
                          className="inline-flex items-center px-4 py-2 bg-red-50 text-red-400 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition-colors"
                        >
                          <FiFileText className="w-4 h-4 mr-2" />
                          Xem Tài Liệu IPFS
                        </button>
                      </div>
                    )}

                    {/* Chi Tra Button for APPROVED claims */}
                    {claim.status === CLAIM_STATUS.APPROVED && (
                      <div className="flex space-x-4">
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

                    {/* Duyet / Tu Choi Form for CHO_HO_SO / DANG_THAM_DINH */}
                    {showActionForm && (
                      <div className="bg-white/5 border border-white/12 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FiAlertCircle className="h-5 w-5 text-red-400" />
                          <h5 className="font-bold text-white/90">
                            Xử Lý Yêu Cầu #{String(claim.claimId)}
                          </h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Approved Amount */}
                          <div>
                            <label className="block text-sm font-bold text-white/80 mb-2">
                              Số Tiền Duyệt (ETH)
                            </label>
                            <input
                              type="number"
                              step="0.0001"
                              min="0"
                              placeholder="Nhập số tiền bồi thường"
                              value={action.approvedAmount || ""}
                              onChange={(e) =>
                                updateClaimAction(
                                  claim.claimId,
                                  "approvedAmount",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all duration-300"
                            />
                          </div>

                          {/* Ly Do */}
                          <div>
                            <label className="block text-sm font-bold text-white/80 mb-2">
                              Lý Do Từ Chối
                            </label>
                            <input
                              type="text"
                              placeholder="Nhập lý do nếu từ chối"
                              value={action.lyDo || ""}
                              onChange={(e) =>
                                updateClaimAction(
                                  claim.claimId,
                                  "lyDo",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 font-medium transition-all duration-300"
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
                            {isProcessing ? "Đang Xử Lý..." : "Duyệt"}
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
                        <span className="text-sm font-semibold">
                          Đang xử lý giao dịch blockchain...
                        </span>
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
  );
};

export default ClaimManagement;







