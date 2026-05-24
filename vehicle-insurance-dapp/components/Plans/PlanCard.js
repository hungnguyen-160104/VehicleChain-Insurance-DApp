import {
  FiCheck,
  FiStar,
  FiShield,
  FiZap,
  FiLock,
  FiTrendingUp,
  FiTruck,
} from "react-icons/fi";
import { INSURANCE_TYPES } from "../../services/contract";

const PlanCard = ({
  insuranceType,
  label,
  description,
  features = [],
  price,
  priceMonthly,
  isPopular = false,
  onSelect,
}) => {
  const getColorClasses = (type, popular) => {
    if (popular) {
      return {
        border: "border-purple-400/50 ring-2 ring-purple-500/30 shadow-purple-500/20",
        gradient: "from-purple-500 to-violet-600",
        bgGradient: "from-purple-900/25 to-violet-900/15",
        button: "from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700",
        badge: "from-purple-500 to-violet-600",
        accent: "text-purple-400",
        iconBg: "from-purple-500 to-violet-600",
      };
    }

    const colorMap = {
      [INSURANCE_TYPES.TNDS_BAT_BUOC]: {
        border: "border-red-500/20 hover:border-red-400/30",
        gradient: "from-red-600 to-orange-600",
        bgGradient: "from-red-900/25 to-orange-900/15",
        button: "from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500",
        badge: "from-red-600 to-orange-600",
        accent: "text-red-400",
        iconBg: "from-red-600 to-orange-600",
      },
      [INSURANCE_TYPES.VAT_CHAT_XE]: {
        border: "border-red-500/20 hover:border-red-400/30",
        gradient: "from-red-500 to-red-700",
        bgGradient: "from-red-900/25 to-red-800/15",
        button: "from-red-600 to-red-700 hover:from-red-500 hover:to-red-600",
        badge: "from-red-500 to-red-700",
        accent: "text-red-400",
        iconBg: "from-red-500 to-red-700",
      },
      [INSURANCE_TYPES.NGUOI_TREN_XE]: {
        border: "border-emerald-500/20 hover:border-emerald-400/30",
        gradient: "from-emerald-500 to-green-600",
        bgGradient: "from-emerald-900/25 to-green-900/15",
        button: "from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500",
        badge: "from-emerald-500 to-green-600",
        accent: "text-emerald-400",
        iconBg: "from-emerald-500 to-green-600",
      },
      [INSURANCE_TYPES.TAI_NAN_LAI_XE]: {
        border: "border-amber-500/20 hover:border-amber-400/30",
        gradient: "from-amber-500 to-orange-500",
        bgGradient: "from-amber-900/25 to-orange-900/15",
        button: "from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400",
        badge: "from-amber-500 to-orange-500",
        accent: "text-amber-400",
        iconBg: "from-amber-500 to-orange-500",
      },
    };

    return colorMap[type] || colorMap[INSURANCE_TYPES.TNDS_BAT_BUOC];
  };

  const colorClasses = getColorClasses(insuranceType, isPopular);

  const isVatChat = insuranceType === INSURANCE_TYPES.VAT_CHAT_XE;

  const defaultFeatures = features.length > 0 ? features : [
    "Bồi thường thiệt hại theo hợp đồng",
    "Xử lý hồ sơ nhanh chóng",
    "Hỗ trợ 24/7",
    "Thanh toán qua blockchain minh bạch",
  ];

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
      ></div>

      <div
        className={`relative backdrop-blur-xl rounded-2xl shadow-xl ${colorClasses.border} border p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] overflow-hidden`}
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        {/* Background Pattern */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bgGradient} opacity-60`}
        ></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

        {/* Floating particles */}
        <div className="absolute top-6 right-6 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-8 right-8 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${colorClasses.badge} shadow-lg border-2 border-white`}
            >
              <FiStar className="w-4 h-4 mr-1 animate-pulse" />
              Phổ biến nhất
            </div>
          </div>
        )}

        <div className="relative text-center">
          {/* Plan Icon and Title */}
          <div className="flex flex-col items-center mb-6">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${colorClasses.iconBg} rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <FiTruck className="h-8 w-8 text-white drop-shadow-sm" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              {label}
            </h3>

            <p className="text-white/60 leading-relaxed max-w-sm text-sm">
              {description}
            </p>
          </div>

          {/* Pricing Section */}
          <div className="mb-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/12">
            {isVatChat ? (
              <div className="text-center">
                <p className={`text-2xl font-bold ${colorClasses.accent}`}>
                  Theo giá trị xe
                </p>
                <p className="text-sm text-white/50 mt-1">
                  Phí tính theo % giá trị xe được bảo hiểm
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <span className="text-3xl font-bold text-white">
                    {price !== undefined ? parseFloat(price).toFixed(4) : "—"}
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-semibold text-white/60">ETH</span>
                    <span className="text-xs text-white/50">một lần/năm</span>
                  </div>
                </div>

                {priceMonthly !== undefined && (
                  <div className="flex items-center justify-center space-x-1 text-sm text-white/60">
                    <FiZap className="h-3 w-3" />
                    <span>hoặc</span>
                    <span className="font-semibold">
                      {parseFloat(priceMonthly).toFixed(4)} ETH
                    </span>
                    <span>/tháng</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Coverage Info */}
          <div className="mb-8 p-4 bg-gradient-to-r from-emerald-900/20 to-green-900/15 rounded-xl border border-emerald-500/25">
            <div className="flex items-center justify-center space-x-2">
              <FiShield className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">
                Bảo hiểm xe cơ giới trên Blockchain
              </span>
              <FiTrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </div>

          {/* Features List */}
          <div className="mb-8 text-left">
            <h4 className="font-semibold text-white mb-4 text-center flex items-center justify-center space-x-2">
              <FiLock className="h-4 w-4" />
              <span>Quyền lợi bảo hiểm</span>
            </h4>

            <ul className="space-y-3">
              {defaultFeatures.map((feature, index) => (
                <li key={index} className="flex items-start group/item">
                  <div
                    className={`w-5 h-5 bg-gradient-to-br ${colorClasses.gradient} rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200`}
                  >
                    <FiCheck className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/80 text-sm group-hover/item:text-white transition-colors">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={onSelect}
            className={`
              group/btn relative w-full py-4 px-6 rounded-xl font-bold text-white text-lg
              bg-gradient-to-r ${colorClasses.button}
              shadow-lg hover:shadow-xl transition-all duration-300
              transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-purple-500/50
              overflow-hidden
            `}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-2">
              <FiTruck className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
              <span>Mua Ngay</span>
              <FiZap className="h-4 w-4 group-hover/btn:animate-pulse" />
            </div>
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-pulse transition-opacity duration-300"></div>
          </button>

          {/* Bottom Info */}
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-white/50">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Smart Contract xác thực</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiShield className="h-3 w-3" />
              <span>Bảo mật Blockchain</span>
            </div>
          </div>
        </div>

        {/* Hover Border Glow */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colorClasses.gradient} opacity-0 group-hover:opacity-20 transition-all duration-300 pointer-events-none`}
        ></div>
      </div>
    </div>
  );
};

export default PlanCard;




