import { useState } from "react";
import {
  FiShield,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiCreditCard,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
  FiZap,
  FiLock,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiTruck,
} from "react-icons/fi";
import {
  PAYMENT_TYPES,
  POLICY_STATUS,
} from "../../services/contract";

const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

const PolicyCard = ({
  policy,
  remainingCoverage,
  claimsCount = 0,
  onPayPremium,
  onCancel,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      0: "bg-gradient-to-r from-emerald-900/20 to-green-900/15 text-emerald-300 border-emerald-500/25",
      1: "bg-gradient-to-r from-red-50 to-rose-50 text-red-300 border-red-500/25",
      2: "bg-gradient-to-r from-white/5 to-white/5 text-white/50 border-white/10",
      3: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-300 border-amber-500/20/50",
    };
    return colors[policy.status] || "bg-white/8 text-white/90 border-white/12";
  };

  const getStatusIndicator = (status) => {
    const indicators = {
      0: { color: "bg-emerald-500", animate: "animate-pulse" },
      1: { color: "bg-red-500", animate: "" },
      2: { color: "bg-gray-500", animate: "" },
      3: { color: "bg-amber-500", animate: "animate-pulse" },
    };
    return indicators[status] || { color: "bg-gray-500", animate: "" };
  };

  const getInsuranceTypeGradient = (type) => {
    const gradients = {
      0: "from-red-600 to-orange-500",
      1: "from-red-500 to-purple-500",
      2: "from-emerald-500 to-teal-500",
      3: "from-amber-500 to-orange-500",
    };
    return gradients[type] || "from-red-600 to-orange-500";
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === "0") return "N/A";
    const ts = parseInt(timestamp);
    const date = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    return date.toLocaleDateString("vi-VN");
  };

  const isExpiringSoon = () => {
    if (!policy?.endDate) return false;
    const ts = parseInt(policy.endDate);
    const expiryDate = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const getCoveragePercentage = () => {
    const used = parseFloat(policy?.claimsUsed || 0);
    const total = parseFloat(policy?.coverageAmount || 1);
    return total > 0 ? (used / total) * 100 : 0;
  };

  const remaining = remainingCoverage !== undefined
    ? parseFloat(remainingCoverage)
    : parseFloat(policy?.coverageAmount || 0) - parseFloat(policy?.claimsUsed || 0);

  const statusIndicator = getStatusIndicator(policy.status);
  const gradient = getInsuranceTypeGradient(policy.insuranceType);

  return (
    <div className="group relative bg-white/8 backdrop-blur-xl rounded-2xl shadow-xl border border-white/12 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-white/5 to-orange-50/30"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl"></div>

      {/* Header */}
      <div className="relative p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <FiTruck className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 ${statusIndicator.color} rounded-full border-2 border-white ${statusIndicator.animate}`}
              ></div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                {policy.vehicleBienSo || "Biển số N/A"}
              </h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-sm text-white/60">
                  {policy.insuranceTypeLabel || "N/A"}
                </p>
                <span className="text-white/40">·</span>
                <p className="text-xs text-white/50">HĐ #{policy.policyId}</p>
                <div className="flex items-center space-x-1">
                  <FiLock className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">
                    Blockchain
                  </span>
                </div>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(policy.status)}`}
          >
            {policy.statusLabel || "N/A"}
          </span>
        </div>

        {/* Expiring Soon Warning */}
        {isExpiringSoon() && policy.status === POLICY_STATUS.ACTIVE && (
          <div className="mb-5 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-500/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiClock className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300 mb-1">
                  Sắp hết hạn
                </h3>
                <p className="text-sm text-amber-700">
                  Hợp đồng sẽ hết hạn vào {formatDate(policy.endDate)}. Vui lòng gia hạn sớm.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Coverage Progress Bar */}
        <div className="mb-5 p-4 bg-white/6 backdrop-blur-sm rounded-xl border border-white/12">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <FiTrendingUp className="h-4 w-4 text-red-400" />
              <span className="text-sm font-semibold text-white/80">
                Hạn mức bảo hiểm đã dùng
              </span>
            </div>
            <span className="text-sm font-bold text-white">
              {parseFloat(policy.claimsUsed || 0).toFixed(4)} /{" "}
              {parseFloat(policy.coverageAmount || 0).toFixed(4)} ETH
            </span>
          </div>

          <div className="relative w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                getCoveragePercentage() > 80
                  ? "bg-gradient-to-r from-red-500 to-rose-500"
                  : getCoveragePercentage() > 60
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                  : "bg-gradient-to-r from-emerald-500 to-green-500"
              }`}
              style={{ width: `${Math.min(getCoveragePercentage(), 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <p className="text-xs font-medium text-white/60">
              {getCoveragePercentage().toFixed(1)}% đã sử dụng
            </p>
            <div className="flex items-center space-x-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-white/60">
                Còn lại: {remaining.toFixed(4)} ETH
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-red-900/15 rounded-lg border border-red-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiCalendar className="h-4 w-4 text-red-400" />
              <span className="text-xs font-semibold text-red-300">Ngày bắt đầu</span>
            </div>
            <p className="text-sm font-bold text-white">{formatDate(policy.startDate)}</p>
          </div>

          <div className="p-3 bg-gradient-to-r from-red-50/50 to-rose-50/50 rounded-lg border border-red-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiCalendar className="h-4 w-4 text-red-400" />
              <span className="text-xs font-semibold text-red-300">Ngày hết hạn</span>
            </div>
            <p className="text-sm font-bold text-white">{formatDate(policy.endDate)}</p>
          </div>

          <div className="p-3 bg-emerald-900/15 rounded-lg border border-emerald-500/25/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiDollarSign className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">Phí bảo hiểm</span>
            </div>
            <p className="text-sm font-bold text-white">
              {parseFloat(policy.premium || 0).toFixed(4)} ETH
            </p>
          </div>

          <div className="p-3 bg-purple-900/15 rounded-lg border border-purple-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiFileText className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300">Số yêu cầu</span>
            </div>
            <p className="text-sm font-bold text-white">{claimsCount}</p>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="relative px-6 py-6 bg-gradient-to-r from-white/5 to-slate-50/50 border-b border-white/10">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <FiZap className="h-5 w-5 text-red-400" />
            <span>Chi Tiết Hợp Đồng</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/6 backdrop-blur-sm rounded-xl border border-white/12">
              <p className="text-xs font-semibold text-white/60 mb-1 uppercase tracking-wide">
                Hình thức thanh toán
              </p>
              <p className="text-sm font-bold text-white">
                {policy.paymentType === PAYMENT_TYPES.MONTHLY
                  ? "Hàng tháng"
                  : "Một lần/Năm"}
              </p>
            </div>

            <div className="p-4 bg-white/6 backdrop-blur-sm rounded-xl border border-white/12">
              <p className="text-xs font-semibold text-white/60 mb-1 uppercase tracking-wide">
                Hạn mức bảo hiểm
              </p>
              <p className="text-sm font-bold text-red-400">
                {parseFloat(policy.coverageAmount || 0).toFixed(4)} ETH
              </p>
            </div>

            <div className="p-4 bg-white/6 backdrop-blur-sm rounded-xl border border-white/12">
              <p className="text-xs font-semibold text-white/60 mb-1 uppercase tracking-wide">
                Tổng phí đã đóng
              </p>
              <p className="text-sm font-bold text-emerald-400">
                {parseFloat(policy.totalPaid || 0).toFixed(4)} ETH
              </p>
            </div>

            <div className="p-4 bg-white/6 backdrop-blur-sm rounded-xl border border-white/12">
              <p className="text-xs font-semibold text-white/60 mb-1 uppercase tracking-wide">
                Trạng thái hợp đồng
              </p>
              <div className="flex items-center space-x-2">
                <FiCheckCircle
                  className={`h-4 w-4 ${
                    policy.status === POLICY_STATUS.ACTIVE
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                />
                <p
                  className={`text-sm font-bold ${
                    policy.status === POLICY_STATUS.ACTIVE
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {policy.statusLabel || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="relative px-6 py-5">
        <div className="flex flex-wrap gap-3">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="group/btn inline-flex items-center px-4 py-2.5 border border-white/10 shadow-sm text-sm font-semibold rounded-xl text-white/80 bg-white/8 backdrop-blur-sm hover:bg-white/8 hover:shadow-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 transition-all duration-200"
          >
            {expanded ? (
              <>
                <FiChevronUp className="h-4 w-4 mr-2" />
                Ẩn chi tiết
              </>
            ) : (
              <>
                <FiChevronDown className="h-4 w-4 mr-2" />
                Xem chi tiết
              </>
            )}
          </button>

          {/* Gia Hạn Button - chỉ hiện khi MONTHLY + ACTIVE */}
          {policy.paymentType === PAYMENT_TYPES.MONTHLY &&
            policy.status === POLICY_STATUS.ACTIVE && (
              <button
                onClick={onPayPremium}
                className="group/btn inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FiCreditCard className="h-4 w-4 mr-2" />
                Gia Hạn
              </button>
            )}

          {/* Nộp Claim Button - chỉ hiện khi ACTIVE */}
          {policy.status === POLICY_STATUS.ACTIVE && (
            <Link
              href={`/claims`}
              className="group/btn inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FiFileText className="h-4 w-4 mr-2" />
              Nộp Claim
            </Link>
          )}

          {/* Hủy Button - chỉ hiện khi ACTIVE */}
          {policy.status === POLICY_STATUS.ACTIVE && (
            <button
              onClick={onCancel}
              className="group/btn inline-flex items-center px-4 py-2.5 border border-red-500/25 shadow-sm text-sm font-semibold rounded-xl text-red-400 bg-white/8 backdrop-blur-sm hover:bg-red-50 hover:shadow-lg hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              <FiX className="h-4 w-4 mr-2" />
              Hủy HĐ
            </button>
          )}
        </div>

        {/* Blockchain Status Footer */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-white/60">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Smart contract đã xác thực</span>
            </div>
            <div className="flex items-center space-x-2 text-red-400">
              <FiLock className="h-3 w-3" />
              <span>Bảo mật Blockchain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Border Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-600/0 via-orange-500/0 to-red-600/0 group-hover:from-red-600/10 group-hover:via-orange-500/10 group-hover:to-red-600/10 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};

export default PolicyCard;





