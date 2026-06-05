import Link from "next/link";
import {
  FiPlus,
  FiFileText,
  FiCreditCard,
  FiShield,
  FiArrowUpRight,
  FiZap,
  FiLock,
} from "react-icons/fi";

const QuickActions = () => {
  const actions = [
    {
      name: "Đăng Ký Xe",
      href: "/plans",
      icon: FiPlus,
      description: "Đăng ký xe và mua bảo hiểm",
      gradient: "from-red-600 to-red-800",
      hoverShadow: "hover:shadow-red-500/30",
    },
    {
      name: "Nộp Bồi Thường",
      href: "/claims",
      icon: FiFileText,
      description: "Yêu cầu bồi thường tai nạn",
      gradient: "from-emerald-500 to-green-700",
      hoverShadow: "hover:shadow-emerald-500/30",
    },
    {
      name: "Gia Hạn Hợp Đồng",
      href: "/policies",
      icon: FiCreditCard,
      description: "Gia hạn phí hàng tháng",
      gradient: "from-purple-600 to-violet-700",
      hoverShadow: "hover:shadow-purple-500/30",
    },
    {
      name: "Xem Hợp Đồng",
      href: "/policies",
      icon: FiShield,
      description: "Quản lý hợp đồng bảo hiểm",
      gradient: "from-orange-500 to-amber-600",
      hoverShadow: "hover:shadow-orange-500/30",
    },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white shadow-sm"
      style={{
        border: "1px solid #f3f4f6",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div className="relative px-6 py-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
            <FiZap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Thao Tác Nhanh</h3>
            <p className="text-sm text-gray-500">Truy cập nhanh các chức năng chính</p>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link key={action.name} href={action.href} className="group relative block">
              <div
                className={`
                  relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} p-6 text-white shadow-lg
                  transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${action.hoverShadow}
                `}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.12),_transparent_60%)]"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                {/* Particles */}
                <div className="absolute top-2 right-2 w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>

                {/* Icon */}
                <div className="relative mb-4">
                  <div className="inline-flex p-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                    <action.icon className="h-6 w-6 drop-shadow-sm" aria-hidden="true" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/25 rounded-full border border-white/40 flex items-center justify-center">
                    <FiLock className="h-2 w-2 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-base font-bold mb-1.5 group-hover:text-white/90 transition-colors">{action.name}</h3>
                  <p className="text-xs text-white/70 leading-relaxed">{action.description}</p>
                </div>

                {/* Arrow */}
                <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <FiArrowUpRight className="h-5 w-5" />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/8 transition-all duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>

              {/* External glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-15 blur-xl transition-all duration-300 -z-10 scale-100 group-hover:scale-110`}></div>
            </Link>
          ))}
        </div>

        {/* Bottom info bar */}
        <div
          className="mt-6 p-4 rounded-xl"
          style={{ background: "rgba(200,16,46,0.06)", border: "1px solid rgba(200,16,46,0.15)" }}
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-red-600">
              <FiShield className="h-3.5 w-3.5" />
              <span className="font-medium">Tất cả giao dịch được bảo mật bởi blockchain</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-400/50"></div>
              <span className="font-medium">Mạng đang hoạt động</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
