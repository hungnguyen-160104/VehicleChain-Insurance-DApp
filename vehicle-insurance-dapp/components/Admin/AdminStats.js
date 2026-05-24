import {
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiShield,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiZap,
  FiSettings,
  FiTruck,
  FiClock,
} from "react-icons/fi";

const AdminStats = ({ adminData, loading, onRefresh }) => {
  const contractStats = adminData?.contractStats || {};
  const pendingClaims = adminData?.pendingClaims || [];
  const contractBalance = adminData?.contractBalance || "0";

  const stats = [
    {
      name: "Số Dư Hợp Đồng",
      value: loading
        ? "..."
        : `${parseFloat(contractBalance || 0).toFixed(4)} ETH`,
      description: "Tổng ETH trong hợp đồng",
      icon: FiDollarSign,
      color: "green",
      change: "Quỹ bảo hiểm",
      changeType: "neutral",
    },
    {
      name: "Tổng Hợp Đồng",
      value: loading ? "..." : String(contractStats.totalPolicies || "0"),
      description: "Hợp đồng bảo hiểm đã tạo",
      icon: FiShield,
      color: "blue",
      change: "Tất cả thời gian",
      changeType: "neutral",
    },
    {
      name: "Tổng Yêu Cầu",
      value: loading ? "..." : String(contractStats.totalClaims || "0"),
      description: "Yêu cầu bồi thường đã nộp",
      icon: FiFileText,
      color: "purple",
      change: "Tất cả thời gian",
      changeType: "neutral",
    },
    {
      name: "Chờ Xử Lý",
      value: loading ? "..." : String(pendingClaims.length || "0"),
      description: "Yêu cầu cần xem xét",
      icon: FiClock,
      color: "yellow",
      change: "Cần xử lý",
      changeType: pendingClaims.length > 0 ? "negative" : "neutral",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: {
        bg: "from-emerald-100 to-green-100",
        text: "text-emerald-400",
        border: "border-emerald-500/25",
        glow: "from-emerald-500/10 to-green-500/10",
      },
      blue: {
        bg: "from-red-900/40 to-orange-900/30",
        text: "text-red-400",
        border: "border-red-200",
        glow: "from-red-600/10 to-orange-500/10",
      },
      purple: {
        bg: "from-purple-100 to-pink-100",
        text: "text-purple-400",
        border: "border-purple-200",
        glow: "from-purple-500/10 to-pink-500/10",
      },
      indigo: {
        bg: "from-red-100 to-purple-100",
        text: "text-red-400",
        border: "border-red-200",
        glow: "from-red-500/10 to-purple-500/10",
      },
      yellow: {
        bg: "from-yellow-100 to-orange-100",
        text: "text-yellow-400",
        border: "border-yellow-200",
        glow: "from-yellow-500/10 to-orange-500/10",
      },
      red: {
        bg: "from-red-100 to-pink-100",
        text: "text-red-400",
        border: "border-red-200",
        glow: "from-red-500/10 to-pink-500/10",
      },
    };
    return colors[color] || colors.indigo;
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case "positive":
        return FiArrowUp;
      case "negative":
        return FiArrowDown;
      default:
        return FiMinus;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-white/10 to-white/15 rounded-xl w-64 mb-2"></div>
            <div className="h-4 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-48"></div>
          </div>
          <div className="h-10 bg-gradient-to-r from-white/10 to-white/15 rounded-xl w-32"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-6 overflow-hidden"
            >
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-white/10 to-white/15 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-2 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-8 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-2/3"></div>
                  <div className="h-4 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-1/2"></div>
                  <div className="h-4 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Tổng Quan Hệ Thống
          </h2>
          <p className="text-white/60">Thống kê bảo hiểm xe cơ giới theo thời gian thực</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="group inline-flex items-center px-4 py-2 bg-white/8 backdrop-blur-xl border border-white/12 shadow-lg text-sm font-medium rounded-xl text-white/80 hover:bg-white/8 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            <FiRefreshCw
              className={`-ml-1 mr-2 h-4 w-4 ${
                loading ? "animate-spin" : "group-hover:scale-110"
              } transition-transform`}
            />
            Làm Mới
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colorScheme = getColorClasses(stat.color);
          const ChangeIcon = getChangeIcon(stat.changeType);

          return (
            <div
              key={stat.name}
              className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-6 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div
                  className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorScheme.glow} rounded-full blur-xl opacity-50`}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br ${colorScheme.glow} rounded-full blur-lg opacity-30`}
                ></div>
              </div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorScheme.bg} border ${colorScheme.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <stat.icon className={`h-6 w-6 ${colorScheme.text}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white mb-1">
                        {stat.name}
                      </p>
                      <p className="text-xs font-medium text-white/60">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                </div>

                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-xl text-sm font-semibold ${
                    stat.changeType === "positive"
                      ? "bg-gradient-to-r from-emerald-900/20 to-green-900/15 text-emerald-400 border border-emerald-500/25"
                      : stat.changeType === "negative"
                      ? "bg-gradient-to-r from-red-900/20 to-pink-900/15 text-red-300 border border-red-500/20"
                      : "bg-gradient-to-r from-gray-50 to-white/8 text-white/80 border border-white/12"
                  }`}
                >
                  <ChangeIcon
                    className={`h-3 w-3 ${
                      stat.changeType === "positive"
                        ? "text-emerald-400"
                        : stat.changeType === "negative"
                        ? "text-red-400"
                        : "text-white/60"
                    }`}
                  />
                  <span>{stat.change}</span>
                </div>

                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorScheme.glow} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contract Health */}
        <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-8">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl"></div>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <FiZap className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Trạng Thái Hợp Đồng
              </h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Trạng thái hợp đồng",
                  value: "Đang hoạt động",
                  type: "success",
                },
                {
                  label: "Chế độ tạm dừng",
                  value: "Đang chạy",
                  type: "success",
                },
                {
                  label: "Loại bảo hiểm",
                  value: "4 loại xe",
                  type: "info",
                },
                {
                  label: "Blockchain",
                  value: "Ethereum / Hardhat",
                  type: "info",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/60">
                    {item.label}
                  </span>
                  {item.type === "success" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-900/20 to-green-900/15 text-emerald-400 border border-emerald-500/25">
                      {item.value}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-8">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-purple-100 flex items-center justify-center">
                <FiSettings className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Thao Tác Nhanh</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: FiTruck,
                  label: "Quản Lý Garage",
                  color: "from-red-600 to-purple-600",
                },
                {
                  icon: FiFileText,
                  label: "Xem Yêu Cầu",
                  color: "from-emerald-600 to-green-600",
                },
                {
                  icon: FiDollarSign,
                  label: "Rút Tiền",
                  color: "from-purple-600 to-pink-600",
                },
                {
                  icon: FiActivity,
                  label: "Xem Thống Kê",
                  color: "from-yellow-600 to-orange-600",
                },
              ].map((action, index) => (
                <button
                  key={index}
                  className={`group relative inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r ${action.color} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <action.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
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
                Hoạt Động Gần Đây
              </h3>
            </div>
          </div>

          <div className="p-8">
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {[
                  {
                    type: "Hợp Đồng Mới",
                    description: "Hợp đồng bảo hiểm TNDS bắt buộc được tạo",
                    time: "Vừa xong",
                    icon: FiShield,
                    iconBg: "from-emerald-500 to-green-500",
                  },
                  {
                    type: "Yêu Cầu Bồi Thường",
                    description: "Yêu cầu bồi thường mới cần xem xét",
                    time: "2 giờ trước",
                    icon: FiFileText,
                    iconBg: "from-red-600 to-orange-500",
                  },
                  {
                    type: "Garage Được Cấp Quyền",
                    description: "Garage mới được thêm vào hệ thống",
                    time: "1 ngày trước",
                    icon: FiTruck,
                    iconBg: "from-purple-500 to-pink-500",
                  },
                  {
                    type: "Chi Trả Bồi Thường",
                    description: "Bồi thường đã được chi trả thành công",
                    time: "2 ngày trước",
                    icon: FiDollarSign,
                    iconBg: "from-red-500 to-purple-500",
                  },
                ].map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <div className="relative pb-8">
                      {itemIdx !== 3 ? (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-300 to-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-4">
                        <div>
                          <span
                            className={`bg-gradient-to-br ${item.iconBg} h-10 w-10 rounded-xl flex items-center justify-center ring-4 ring-white shadow-lg`}
                          >
                            <item.icon
                              className="h-5 w-5 text-white"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm font-bold text-white mb-1">
                              {item.type}
                            </p>
                            <p className="text-sm text-white/60">
                              {item.description}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm">
                            <time className="text-white/50 font-medium">
                              {item.time}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;






