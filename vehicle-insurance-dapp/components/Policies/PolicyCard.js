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
      0: "bg-emerald-50 text-emerald-700 border-emerald-200",
      1: "bg-red-50 text-red-600 border-red-200",
      2: "bg-gray-100 text-gray-500 border-gray-200",
      3: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colors[policy.status] || "bg-gray-100 text-gray-700 border-gray-200";
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
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
      {/* Header */}
      <div className="relative p-6 border-b border-gray-100">
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
              <h3 className="text-xl font-bold text-gray-900">
                {policy.vehicleBienSo || "Biển số N/A"}
              </h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-sm text-gray-500">
                  {policy.insuranceTypeLabel || "N/A"}
                </p>
                <span className="text-gray-300">·</span>
                <p className="text-xs text-gray-400">HĐ #{policy.policyId}</p>
                <div className="flex items-center space-x-1">
                  <FiLock className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">
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
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiClock className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-700 mb-1">
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
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <FiTrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-gray-700">
                Hạn mức bảo hiểm đã dùng
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {parseFloat(policy.claimsUsed || 0).toFixed(4)} /{" "}
              {parseFloat(policy.coverageAmount || 0).toFixed(4)} ETH
            </span>
          </div>

          <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                getCoveragePercentage() > 80
                  ? "bg-gradient-to-r from-red-500 to-rose-500"
                  : getCoveragePercentage() > 60
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                  : "bg-gradient-to-r from-emerald-500 to-green-500"
              }`}
              style={{ width: `${Math.min(getCoveragePercentage(), 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <p className="text-xs font-medium text-gray-500">
              {getCoveragePercentage().toFixed(1)}% đã sử dụng
            </p>
            <div className="flex items-center space-x-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-500">
                Còn lại: {remaining.toFixed(4)} ETH
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2 mb-1">
              <FiCalendar className="h-4 w-4 text-red-500" />
              <span className="text-xs font-semibold text-red-600">Ngày bắt đầu</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{formatDate(policy.startDate)}</p>
          </div>

          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2 mb-1">
              <FiCalendar className="h-4 w-4 text-red-500" />
              <span className="text-xs font-semibold text-red-600">Ngày hết hạn</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{formatDate(policy.endDate)}</p>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center space-x-2 mb-1">
              <FiDollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-600">Phí bảo hiểm</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {parseFloat(policy.premium || 0).toFixed(4)} ETH
            </p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-1">
              <FiFileText className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600">Số yêu cầu</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{claimsCount}</p>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="relative px-6 py-6 bg-gray-50 border-b border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FiZap className="h-5 w-5 text-red-500" />
            <span>Chi Tiết Hợp Đồng</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Hình thức thanh toán
              </p>
              <p className="text-sm font-bold text-gray-900">
                {policy.paymentType === PAYMENT_TYPES.MONTHLY
                  ? "Hàng tháng"
                  : "Một lần/Năm"}
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Hạn mức bảo hiểm
              </p>
              <p className="text-sm font-bold text-red-600">
                {parseFloat(policy.coverageAmount || 0).toFixed(4)} ETH
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Tổng phí đã đóng
              </p>
              <p className="text-sm font-bold text-emerald-600">
                {parseFloat(policy.totalPaid || 0).toFixed(4)} ETH
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Trạng thái hợp đồng
              </p>
              <div className="flex items-center space-x-2">
                <FiCheckCircle
                  className={`h-4 w-4 ${
                    policy.status === POLICY_STATUS.ACTIVE
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                />
                <p
                  className={`text-sm font-bold ${
                    policy.status === POLICY_STATUS.ACTIVE
                      ? "text-emerald-600"
                      : "text-red-600"
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
            className="group/btn inline-flex items-center px-4 py-2.5 border border-gray-200 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 transition-all duration-200"
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
              className="group/btn inline-flex items-center px-4 py-2.5 border border-red-200 shadow-sm text-sm font-semibold rounded-xl text-red-600 bg-white hover:bg-red-50 hover:shadow-md hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              <FiX className="h-4 w-4 mr-2" />
              Hủy HĐ
            </button>
          )}
        </div>

        {/* Blockchain Status Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Smart contract đã xác thực</span>
            </div>
            <div className="flex items-center space-x-2 text-red-500">
              <FiLock className="h-3 w-3" />
              <span>Bảo mật Blockchain</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
