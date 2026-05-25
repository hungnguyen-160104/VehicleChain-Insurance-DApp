import {
  FiShield,
  FiFileText,
  FiCreditCard,
  FiActivity,
  FiZap,
  FiCheck,
  FiX,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import { CLAIM_STATUS } from "../../services/contract";

const glassCard = {
  background: "#fff",
  border: "1px solid #f3f4f6",
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
};

const RecentActivity = ({ policies = [], claims = [], loading = false }) => {
  const getActivities = () => {
    const activities = [];

    policies.forEach((policy) => {
      activities.push({
        id: `policy-${policy.policyId}`,
        type: "policy_created",
        icon: FiShield,
        title: "Mua bảo hiểm",
        description: `Hợp đồng #${policy.policyId} - ${policy.vehicleBienSo || ""}`,
        timestamp: parseInt(policy.startDate || Date.now() / 1000),
        color: "indigo",
        amount: `${parseFloat(policy.premium || 0).toFixed(4)} ETH`,
      });

      if (policy.lastPaymentDate && policy.lastPaymentDate !== policy.startDate) {
        activities.push({
          id: `payment-${policy.policyId}`,
          type: "premium_paid",
          icon: FiCreditCard,
          title: "Gia hạn hàng tháng",
          description: `Phí hàng tháng cho hợp đồng #${policy.policyId}`,
          timestamp: parseInt(policy.lastPaymentDate),
          color: "green",
          amount: `${parseFloat(policy.premium || 0).toFixed(4)} ETH`,
        });
      }
    });

    claims.forEach((claim) => {
      const submissionSec = Math.floor((claim.submissionDate || Date.now()) / 1000);
      activities.push({
        id: `claim-${claim.claimId}`,
        type: "claim_submitted",
        icon: FiFileText,
        title: "Yêu cầu bồi thường",
        description: claim.description || `Yêu cầu #${claim.claimId}`,
        timestamp: submissionSec,
        color: "yellow",
        amount: `${parseFloat(claim.claimAmount || 0).toFixed(4)} ETH`,
        status: claim.status,
      });

      if (claim.processedDate && claim.processedDate !== 0) {
        const processedSec = Math.floor(claim.processedDate / 1000);
        activities.push({
          id: `claim-processed-${claim.claimId}`,
          type: "claim_processed",
          icon: claim.status === CLAIM_STATUS.APPROVED || claim.status === CLAIM_STATUS.PAID ? FiCheck : FiX,
          title: claim.status === CLAIM_STATUS.APPROVED || claim.status === CLAIM_STATUS.PAID ? "Đã duyệt bồi thường" : "Từ chối bồi thường",
          description: `Yêu cầu #${claim.claimId} đã xử lý`,
          timestamp: processedSec,
          color: claim.status === CLAIM_STATUS.APPROVED || claim.status === CLAIM_STATUS.PAID ? "green" : "red",
          amount: claim.status === CLAIM_STATUS.APPROVED || claim.status === CLAIM_STATUS.PAID
            ? `${parseFloat(claim.approvedAmount || 0).toFixed(4)} ETH`
            : null,
        });
      }
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  };

  const activities = getActivities();

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getColorClasses = (color) => {
    const colors = {
      indigo: { bg: "rgba(200,16,46,0.08)", border: "rgba(200,16,46,0.15)", text: "text-red-600" },
      green: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)", text: "text-emerald-600" },
      yellow: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)", text: "text-amber-700" },
      red: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)", text: "text-red-600" },
      purple: { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)", text: "text-purple-600" },
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl" style={glassCard}>
      <div className="relative px-6 py-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <FiActivity className="h-5 w-5 text-white" />
            </div>
            {activities.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-white">{Math.min(activities.length, 9)}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Hoạt Động Gần Đây</h3>
            <p className="text-sm text-gray-500">Lịch sử giao dịch blockchain của bạn</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4 animate-pulse">
                <div className="h-11 w-11 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2 pt-1">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded-lg w-1/3"></div>
                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-lg w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded-lg w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center shadow-lg border border-gray-200">
                <FiActivity className="h-10 w-10 text-gray-300" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <FiZap className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Chưa Có Hoạt Động</h3>
            <p className="text-gray-400 mb-6 text-sm max-w-xs mx-auto">
              Các hoạt động bảo hiểm blockchain của bạn sẽ xuất hiện tại đây.
            </p>
            <button className="group inline-flex items-center text-sm text-red-600 hover:text-red-700 font-semibold transition-colors">
              <span>Khám phá gói bảo hiểm</span>
              <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-6">
              {activities.map((activity, activityIdx) => {
                const colorStyle = getColorClasses(activity.color);
                return (
                  <li key={activity.id}>
                    <div className="relative pb-6">
                      {activityIdx !== activities.length - 1 && (
                        <span className="absolute top-6 left-5 -ml-px h-full w-px bg-gradient-to-b from-gray-200 via-gray-100 to-transparent" aria-hidden="true" />
                      )}

                      <div className="relative flex space-x-4">
                        {/* Icon */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${colorStyle.text}`}
                            style={{ background: colorStyle.bg, border: `1px solid ${colorStyle.border}` }}
                          >
                            <activity.icon className="h-4.5 w-4.5" aria-hidden="true" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm bg-white border border-gray-200">
                            {activity.type === "policy_created" && <FiShield className="h-2 w-2 text-red-500" />}
                            {activity.type === "premium_paid" && <FiCreditCard className="h-2 w-2 text-emerald-500" />}
                            {activity.type === "claim_submitted" && <FiClock className="h-2 w-2 text-amber-600" />}
                            {activity.type === "claim_processed" && <FiCheck className="h-2 w-2 text-emerald-500" />}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-0.5">
                              <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                              <FiTrendingUp className="h-3 w-3 text-red-400" />
                            </div>
                            <p className="text-xs text-gray-500 truncate max-w-xs mb-2">{activity.description}</p>
                            {activity.amount && (
                              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                                <FiZap className="h-3 w-3 text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-600">{activity.amount}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                            <time className="text-xs font-medium text-gray-400" dateTime={new Date(activity.timestamp * 1000).toISOString()}>
                              {formatDate(activity.timestamp)}
                            </time>
                            <div className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-sm shadow-green-400/50"></div>
                              <span className="text-[10px] text-gray-400">On-chain</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {activities.length > 0 && (
          <div className="mt-6 pt-4" style={{ borderTop: "1px solid #f3f4f6" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
                <span>Tất cả giao dịch đã được xác thực blockchain</span>
              </div>
              <button className="group inline-flex items-center text-xs text-red-600 hover:text-red-700 font-semibold transition-colors">
                <span>Xem toàn bộ</span>
                <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
