import {
  FiRefreshCw,
  FiShield,
  FiCalendar,
  FiDollarSign,
  FiZap,
  FiLock,
  FiTrendingUp,
  FiTruck,
} from "react-icons/fi";
import { POLICY_STATUS } from "../../services/contract";

const glassCard = {
  background: "#fff",
  border: "1px solid #f3f4f6",
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
};

const PolicyOverview = ({ policies = [], loading = false, onRefresh }) => {
  const getStatusColor = (status) => {
    const colors = {
      0: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      1: "bg-red-50 text-red-600 border border-red-200",
      2: "bg-gray-100 text-gray-500 border border-gray-200",
      3: "bg-amber-50 text-amber-700 border border-amber-200",
    };
    return colors[status] || "bg-gray-100 text-gray-500 border border-gray-200";
  };

  const getStatusIndicator = (status) => {
    const indicators = {
      0: "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50",
      1: "bg-red-400",
      2: "bg-gray-300",
      3: "bg-amber-400 animate-pulse",
    };
    return indicators[status] || "bg-gray-300";
  };

  const getInsuranceTypeGradient = (insuranceType) => {
    const gradients = {
      0: "from-red-600 to-orange-500",
      1: "from-purple-500 to-pink-500",
      2: "from-amber-500 to-orange-500",
      3: "from-rose-500 to-red-500",
    };
    return gradients[insuranceType] || "from-slate-500 to-slate-600";
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === "0") return "N/A";
    const ts = parseInt(timestamp);
    const date = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    return date.toLocaleDateString("vi-VN");
  };

  const activePolicies = policies.filter((p) => p.status === POLICY_STATUS.ACTIVE);

  return (
    <div className="relative overflow-hidden rounded-2xl" style={glassCard}>
      <div className="relative px-6 py-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                <FiShield className="h-5 w-5 text-white" />
              </div>
              {activePolicies.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">{activePolicies.length}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Tổng Quan Hợp Đồng</h3>
              <p className="text-sm text-gray-500">Danh sách hợp đồng bảo hiểm của bạn</p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="group inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all duration-200 disabled:opacity-40 bg-gray-50 hover:bg-gray-100"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <FiRefreshCw className={`h-4 w-4 mr-2 transition-transform ${loading ? "animate-spin text-purple-500" : "group-hover:rotate-180"}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl p-5 animate-pulse bg-gray-50" style={{ border: "1px solid #f3f4f6" }}>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="h-11 w-11 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-lg w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded-lg w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-8 bg-gray-100 rounded-lg"></div>
                  <div className="h-8 bg-gray-100 rounded-lg"></div>
                  <div className="h-8 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-red-100 rounded-2xl flex items-center justify-center shadow-lg border border-gray-200">
                <FiShield className="h-10 w-10 text-purple-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <FiLock className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Chưa Có Hợp Đồng</h3>
            <p className="text-gray-500 mb-6 text-sm max-w-xs mx-auto">Bảo vệ xe của bạn với các gói bảo hiểm xe cơ giới trên blockchain.</p>
            <a
              href="/plans"
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-700 to-red-700 hover:from-purple-600 hover:to-red-600 shadow-lg shadow-purple-900/20 transition-all duration-200 hover:scale-105"
            >
              <FiShield className="mr-2 h-4 w-4" />
              Xem Gói Bảo Hiểm
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {policies.slice(0, 3).map((policy, index) => {
              const gradient = getInsuranceTypeGradient(policy.insuranceType);
              return (
                <div
                  key={policy.policyId || index}
                  className="group relative rounded-xl p-5 transition-all duration-300 overflow-hidden bg-gray-50 hover:bg-white"
                  style={{ border: "1px solid #f3f4f6" }}
                >
                  <div className="relative flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                          <FiTruck className="h-5 w-5 text-white" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${getStatusIndicator(policy.status)}`}></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{policy.vehicleBienSo || "Biển số N/A"}</p>
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <FiShield className="h-3 w-3" />
                          <span>{policy.insuranceTypeLabel || "N/A"}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(policy.status)}`}>
                      {policy.statusLabel || "N/A"}
                    </span>
                  </div>

                  <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg" style={{ background: "rgba(200,16,46,0.06)", border: "1px solid rgba(200,16,46,0.12)" }}>
                      <FiCalendar className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                      <span className="text-gray-600"><span className="font-semibold text-gray-800">Hết hạn:</span> {formatDate(policy.endDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
                      <FiDollarSign className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-600"><span className="font-semibold text-gray-800">Phí:</span> {parseFloat(policy.premium || 0).toFixed(4)} ETH</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                      <FiTrendingUp className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-600"><span className="font-semibold text-gray-800">BH:</span> {parseFloat(policy.coverageAmount || 0).toFixed(2)} ETH</span>
                    </div>
                  </div>

                  {policy.status === POLICY_STATUS.ACTIVE && (
                    <div className="mt-3 p-2.5 rounded-lg flex items-center justify-between" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                      <div className="flex items-center space-x-2">
                        <FiZap className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-600">Hợp đồng đang hiệu lực</span>
                      </div>
                      <FiTrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                  )}
                </div>
              );
            })}

            {policies.length > 3 && (
              <div className="text-center pt-2">
                <a href="/policies" className="group inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                  <span>Xem tất cả {policies.length} hợp đồng</span>
                  <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyOverview;
