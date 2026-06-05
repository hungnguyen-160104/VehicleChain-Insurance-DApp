import {
  FiRefreshCw,
  FiFileText,
  FiClock,
  FiCheck,
  FiX,
  FiShield,
  FiZap,
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiDollarSign,
} from "react-icons/fi";
import Link from "next/link";
import { CLAIM_STATUS } from "../../services/contract";

const glassCard = {
  background: "#fff",
  border: "1px solid #f3f4f6",
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
};

const ClaimsOverview = ({ claims = [], loading = false, onRefresh }) => {
  const getStatusColor = (status) => {
    const colors = {
      0: "bg-gray-100 text-gray-500 border border-gray-200",
      1: "bg-red-50 text-red-600 border border-red-200",
      2: "bg-amber-50 text-amber-700 border border-amber-200",
      3: "bg-orange-50 text-orange-600 border border-orange-200",
      4: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      5: "bg-red-50 text-red-600 border border-red-200",
      6: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
    return colors[status] || "bg-gray-100 text-gray-500 border border-gray-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      0: "Chờ xử lý",
      1: "Đang giám định",
      2: "Chờ hồ sơ",
      3: "Đang thẩm định",
      4: "Đã duyệt",
      5: "Từ chối",
      6: "Đã chi trả",
    };
    return labels[status] ?? "Không xác định";
  };

  const getStatusIcon = (status) => {
    const icons = {
      0: FiClock,
      1: FiSearch,
      2: FiFileText,
      3: FiAlertCircle,
      4: FiCheck,
      5: FiX,
      6: FiCheckCircle,
    };
    return icons[status] || FiClock;
  };

  const getStatusGradient = (status) => {
    const gradients = {
      0: "from-slate-500 to-slate-600",
      1: "from-red-600 to-orange-500",
      2: "from-yellow-500 to-amber-600",
      3: "from-orange-500 to-amber-600",
      4: "from-emerald-500 to-green-600",
      5: "from-red-600 to-rose-600",
      6: "from-emerald-600 to-teal-600",
    };
    return gradients[status] || "from-slate-500 to-slate-600";
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === "0") return "N/A";
    const ts = parseInt(timestamp);
    const date = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    return date.toLocaleDateString("vi-VN");
  };

  const pendingCount = claims.filter((c) => c.status === CLAIM_STATUS.PENDING).length;

  return (
    <div className="relative overflow-hidden rounded-2xl" style={glassCard}>
      <div className="relative px-6 py-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                <FiFileText className="h-5 w-5 text-white" />
              </div>
              {pendingCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{pendingCount}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Yêu Cầu Bồi Thường</h3>
              <p className="text-sm text-gray-500">Theo dõi trạng thái yêu cầu bảo hiểm</p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="group inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all duration-200 disabled:opacity-40 bg-gray-50 hover:bg-gray-100"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <FiRefreshCw className={`h-4 w-4 mr-2 transition-transform ${loading ? "animate-spin text-red-500" : "group-hover:rotate-180"}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse bg-gray-50" style={{ border: "1px solid #f3f4f6" }}>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-3.5 bg-gray-200 rounded-lg w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded-lg w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20 flex-shrink-0"></div>
                </div>
              </div>
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg border border-gray-200">
                <FiFileText className="h-10 w-10 text-red-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-orange-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                <FiZap className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Chưa Có Yêu Cầu Bồi Thường</h3>
            <p className="text-gray-500 mb-6 text-sm max-w-xs mx-auto">Khi xảy ra tai nạn, bạn có thể gửi yêu cầu bồi thường tại đây.</p>
            <Link
              href="/claims"
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500 shadow-lg shadow-red-900/20 transition-all duration-200 hover:scale-105"
            >
              <FiFileText className="mr-2 h-4 w-4" />
              Nộp Yêu Cầu Đầu Tiên
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.slice(0, 5).map((claim, index) => {
              const StatusIcon = getStatusIcon(claim.status);
              const gradient = getStatusGradient(claim.status);

              return (
                <div
                  key={claim.claimId || index}
                  className="group relative rounded-xl p-4 transition-all duration-300 overflow-hidden bg-gray-50 hover:bg-white"
                  style={{ border: "1px solid #f3f4f6" }}
                >
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                          <StatusIcon className="h-5 w-5 text-white" />
                        </div>
                        {claim.status === CLAIM_STATUS.PENDING && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-sm shadow-amber-400/50"></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-0.5">
                          <p className="text-sm font-bold text-gray-900">Yêu cầu #{claim.claimId || "N/A"}</p>
                          <span className="text-xs text-gray-400">· HĐ #{claim.policyId || "N/A"}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <FiDollarSign className="h-3 w-3" />
                            <span>{parseFloat(claim.claimAmount || 0).toFixed(4)} ETH</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FiClock className="h-3 w-3" />
                            <span>{formatDate(claim.submissionDate)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-3 ${getStatusColor(claim.status)}`}>
                      {claim.statusLabel || getStatusLabel(claim.status)}
                    </span>
                  </div>

                  {(claim.status === 4 || claim.status === 6) && claim.approvedAmount && (
                    <div className="mt-2.5 p-2 rounded-lg flex items-center space-x-2" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                      <FiCheck className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-600">
                        Số tiền duyệt: {parseFloat(claim.approvedAmount || 0).toFixed(4)} ETH
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {claims.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/claims" className="group inline-flex items-center text-sm text-red-600 hover:text-red-700 font-semibold transition-colors">
                  <span>Xem tất cả {claims.length} yêu cầu</span>
                  <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsOverview;
