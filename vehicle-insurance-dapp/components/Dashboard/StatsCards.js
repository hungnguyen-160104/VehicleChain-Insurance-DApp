import {
  FiShield,
  FiFileText,
  FiDollarSign,
  FiTruck,
  FiTrendingUp,
  FiArrowUpRight,
  FiZap,
  FiLock,
  FiActivity,
} from "react-icons/fi";
import { POLICY_STATUS } from "../../services/contract";

const StatsCards = ({
  policies = [],
  claims = [],
  contractStats = {},
  userVehicles = [],
  loading = false,
}) => {
  const activePolicies = policies.filter(
    (p) => p.status === POLICY_STATUS.ACTIVE
  ).length;

  const totalPaid = policies.reduce(
    (sum, policy) => sum + parseFloat(policy.totalPaid || 0),
    0
  );

  const stats = [
    {
      name: "Xe Đã Đăng Ký",
      value: loading ? "..." : userVehicles.length.toString(),
      icon: FiTruck,
      description: "Xe đã đăng ký bảo hiểm",
      changeType: "positive",
      gradient: "from-red-500 to-red-700",
      glow: "rgba(200,16,46,0.3)",
    },
    {
      name: "Hợp Đồng Hiệu Lực",
      value: loading ? "..." : activePolicies.toString(),
      icon: FiShield,
      description: "Hợp đồng đang còn hiệu lực",
      changeType: "positive",
      gradient: "from-emerald-500 to-green-600",
      glow: "rgba(16,185,129,0.25)",
    },
    {
      name: "Yêu Cầu Bồi Thường",
      value: loading ? "..." : claims.length.toString(),
      icon: FiFileText,
      description: "Tổng yêu cầu đã nộp",
      changeType: claims.length > 0 ? "neutral" : "positive",
      gradient: "from-amber-500 to-yellow-600",
      glow: "rgba(245,158,11,0.25)",
    },
    {
      name: "Tổng Phí Đã Đóng",
      value: loading ? "..." : `${totalPaid.toFixed(4)} ETH`,
      icon: FiDollarSign,
      description: "Tổng phí bảo hiểm đã thanh toán",
      changeType: "positive",
      gradient: "from-purple-500 to-violet-600",
      glow: "rgba(139,92,246,0.25)",
    },
  ];

  const getChangeIcon = (changeType) => {
    if (changeType === "positive") return FiTrendingUp;
    if (changeType === "negative") return FiArrowUpRight;
    return FiActivity;
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const ChangeIcon = getChangeIcon(stat.changeType);

        return (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)`,
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
              style={{ boxShadow: `inset 0 0 40px ${stat.glow}`, background: `radial-gradient(circle at 50% 0%, ${stat.glow}, transparent 70%)` }}
            ></div>

            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${stat.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}></div>

            {/* Floating particles */}
            <div className="absolute top-4 right-4 w-1 h-1 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: "2s" }}></div>

            <div className="relative p-6">
              {/* Icon Section */}
              <div className="flex items-center justify-between mb-5">
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <stat.icon className="h-6 w-6 text-white drop-shadow-sm" aria-hidden="true" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black/50 flex items-center justify-center shadow-sm">
                    <FiLock className="h-2 w-2 text-white" />
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
                  <span className="text-xs font-medium text-white/40">Live</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-white/50 tracking-widest uppercase">
                  {stat.name}
                </h3>

                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-white/10 rounded-lg w-20"></div>
                  </div>
                ) : (
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                    <FiZap className="h-4 w-4 text-red-400" />
                  </div>
                )}

                <p className="text-xs text-white/40 font-medium">{stat.description}</p>
              </div>

              {/* Bottom reveal on hover */}
              <div className="absolute inset-x-0 bottom-0 px-6 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-full group-hover:translate-y-0"
                style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-white/40">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span>On-chain verified</span>
                  </div>
                  <button className={`text-xs font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    Details →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
