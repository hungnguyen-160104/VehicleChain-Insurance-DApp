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
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
};

const PolicyOverview = ({ policies = [], loading = false, onRefresh }) => {
  const getStatusColor = (status) => {
    const colors = {
      0: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
      1: "bg-red-500/15 text-red-300 border border-red-500/30",
      2: "bg-white/10 text-white/50 border border-white/15",
      3: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    };
    return colors[status] || "bg-white/10 text-white/50 border border-white/15";
  };

  const getStatusIndicator = (status) => {
    const indicators = {
      0: "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50",
      1: "bg-red-400",
      2: "bg-white/30",
      3: "bg-amber-400 animate-pulse",
    };
    return indicators[status] || "bg-white/30";
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
      {/* Background glows */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-purple-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-900/20 rounded-full blur-2xl pointer-events-none"></div>
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>

      <div className="relative px-6 py-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/50">
                <FiShield className="h-5 w-5 text-white" />
              </div>
              {activePolicies.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-black/50 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">{activePolicies.length}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Tổng Quan Hợp Đồng</h3>
              <p className="text-sm text-white/50">Danh sách hợp đồng bảo hiểm của bạn</p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="group inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-all duration-200 disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
          >
            <FiRefreshCw className={`h-4 w-4 mr-2 transition-transform ${loading ? "animate-spin text-purple-400" : "group-hover:rotate-180"}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl p-5 animate-pulse" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="h-11 w-11 bg-white/10 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded-lg w-1/3 mb-2"></div>
                    <div className="h-3 bg-white/8 rounded-lg w-1/2"></div>
                  </div>
                  <div className="h-6 bg-white/10 rounded-full w-20"></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-8 bg-white/5 rounded-lg"></div>
                  <div className="h-8 bg-white/5 rounded-lg"></div>
                  <div className="h-8 bg-white/5 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-800/50 to-red-800/50 rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                <FiShield className="h-10 w-10 text-purple-300" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <FiLock className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Chưa Có Hợp Đồng</h3>
            <p className="text-white/50 mb-6 text-sm max-w-xs mx-auto">Bảo vệ xe của bạn với các gói bảo hiểm xe cơ giới trên blockchain.</p>
            <a
              href="/plans"
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-700 to-red-700 hover:from-purple-600 hover:to-red-600 shadow-lg shadow-purple-900/40 transition-all duration-200 hover:scale-105"
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
                  className="group relative rounded-xl p-5 transition-all duration-300 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 to-red-600/0 group-hover:from-purple-600/8 group-hover:to-red-600/8 transition-all duration-300"></div>

                  <div className="relative flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                          <FiTruck className="h-5 w-5 text-white" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${getStatusIndicator(policy.status)}`}></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{policy.vehicleBienSo || "Biển số N/A"}</p>
                        <p className="text-xs text-white/50 flex items-center space-x-1">
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
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg" style={{ background: "rgba(200,16,46,0.12)", border: "1px solid rgba(200,16,46,0.15)" }}>
                      <FiCalendar className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                      <span className="text-white/70"><span className="font-semibold text-white/90">Hết hạn:</span> {formatDate(policy.endDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg" style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.15)" }}>
                      <FiDollarSign className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-white/70"><span className="font-semibold text-white/90">Phí:</span> {parseFloat(policy.premium || 0).toFixed(4)} ETH</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg" style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.15)" }}>
                      <FiTrendingUp className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                      <span className="text-white/70"><span className="font-semibold text-white/90">BH:</span> {parseFloat(policy.coverageAmount || 0).toFixed(2)} ETH</span>
                    </div>
                  </div>

                  {policy.status === POLICY_STATUS.ACTIVE && (
                    <div className="mt-3 p-2.5 rounded-lg flex items-center justify-between" style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.20)" }}>
                      <div className="flex items-center space-x-2">
                        <FiZap className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-300">Hợp đồng đang hiệu lực</span>
                      </div>
                      <FiTrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  )}
                </div>
              );
            })}

            {policies.length > 3 && (
              <div className="text-center pt-2">
                <a href="/policies" className="group inline-flex items-center text-sm text-purple-400 hover:text-purple-300 font-semibold transition-colors">
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
