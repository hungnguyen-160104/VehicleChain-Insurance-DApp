import { useState } from "react";
import {
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCheck,
  FiX,
  FiEye,
  FiShield,
  FiZap,
  FiLock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiTruck,
} from "react-icons/fi";
import { CLAIM_STATUS } from "../../services/contract";

const ClaimCard = ({ claim, onProcess }) => {
  const [expanded, setExpanded] = useState(false);
  const [viewingDocuments, setViewingDocuments] = useState(false);

  // 7 trạng thái: 0=Chờ xử lý, 1=Đang giám định, 2=Chờ hồ sơ, 3=Đang thẩm định, 4=Đã duyệt, 5=Từ chối, 6=Đã chi trả
  const getStatusColor = (status) => {
    const colors = {
      0: "bg-gradient-to-r from-gray-50 to-slate-50 text-white/80 border-white/10",
      1: "bg-gradient-to-r from-red-50 to-orange-50 text-red-300 border-red-500/25",
      2: "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 border-yellow-500/20",
      3: "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-300 border-orange-500/20",
      4: "bg-gradient-to-r from-emerald-900/20 to-green-900/15 text-emerald-300 border-emerald-500/25",
      5: "bg-gradient-to-r from-red-50 to-rose-50 text-red-300 border-red-500/25",
      6: "bg-gradient-to-r from-emerald-900/25 to-teal-900/20 text-emerald-300 border-emerald-300/50",
    };
    return colors[claim.status] || "bg-white/8 text-white/90 border-white/12";
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
      0: "from-gray-400 to-slate-500",
      1: "from-red-600 to-orange-500",
      2: "from-yellow-500 to-amber-500",
      3: "from-orange-500 to-amber-600",
      4: "from-emerald-500 to-green-500",
      5: "from-red-500 to-rose-500",
      6: "from-emerald-600 to-teal-600",
    };
    return gradients[status] || "from-gray-500 to-gray-600";
  };

  const getStatusIndicator = (status) => {
    const indicators = {
      0: { color: "bg-gray-400", animate: "" },
      1: { color: "bg-red-600", animate: "animate-pulse" },
      2: { color: "bg-yellow-500", animate: "animate-pulse" },
      3: { color: "bg-orange-500", animate: "animate-pulse" },
      4: { color: "bg-emerald-500", animate: "animate-pulse" },
      5: { color: "bg-red-500", animate: "" },
      6: { color: "bg-emerald-600", animate: "" },
    };
    return indicators[status] || { color: "bg-gray-500", animate: "" };
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === "0") return "N/A";
    const ts = parseInt(timestamp);
    const date = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(4);
  };

  const handleViewDocuments = () => {
    if (claim?.ipfsDocuments) {
      try {
        setViewingDocuments(true);
        window.open(
          `https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments}`,
          "_blank"
        );
      } catch (error) {
        console.error("Error viewing documents:", error);
      } finally {
        setViewingDocuments(false);
      }
    }
  };

  // 5-step progress indicator: Nộp → Giám định → Thẩm định → Duyệt → Chi trả
  const progressSteps = [
    { label: "Đã nộp", status: 0 },
    { label: "Giám định", status: 1 },
    { label: "Thẩm định", status: 3 },
    { label: "Duyệt", status: 4 },
    { label: "Chi trả", status: 6 },
  ];

  const getProgressIndex = () => {
    const s = claim.status;
    if (s === 6) return 4;
    if (s === 4) return 3;
    if (s === 3) return 2;
    if (s === 1 || s === 2) return 1;
    return 0;
  };

  const progressIndex = getProgressIndex();
  const StatusIcon = getStatusIcon(claim.status);
  const statusIndicator = getStatusIndicator(claim.status);
  const statusGradient = getStatusGradient(claim.status);

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
                className={`w-14 h-14 bg-gradient-to-br ${statusGradient} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <StatusIcon className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 ${statusIndicator.color} rounded-full border-2 border-white ${statusIndicator.animate}`}
              ></div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Yêu cầu #{claim.claimId}
              </h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-sm text-white/60">HĐ #{claim.policyId}</p>
                {claim.vehicleBienSo && (
                  <>
                    <span className="text-white/40">·</span>
                    <div className="flex items-center space-x-1 text-sm text-white/60">
                      <FiTruck className="h-3 w-3" />
                      <span>{claim.vehicleBienSo}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-1">
                  <FiShield className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">
                    Blockchain
                  </span>
                </div>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(claim.status)}`}
          >
            {claim.statusLabel || getStatusLabel(claim.status)}
          </span>
        </div>

        {/* 5-Step Progress Indicator */}
        {claim.status !== CLAIM_STATUS.REJECTED && (
          <div className="mb-5 p-4 bg-white/6 backdrop-blur-sm rounded-xl border border-white/12">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-1 bg-white/10 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(progressIndex / 4) * 100}%` }}
                ></div>
              </div>
              {progressSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      index <= progressIndex
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-white border-gray-300 text-white/40"
                    }`}
                  >
                    {index < progressIndex ? (
                      <FiCheck className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-1 text-xs font-medium ${
                      index <= progressIndex ? "text-red-400" : "text-white/40"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected status display */}
        {claim.status === CLAIM_STATUS.REJECTED && (
          <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiXCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-300 mb-1">
                  Yêu cầu bị từ chối
                </h4>
                {claim.lyDoTuChoi && (
                  <p className="text-sm text-red-400">
                    <span className="font-semibold">Lý do:</span> {claim.lyDoTuChoi}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {claim.description && (
          <div className="mb-5">
            <div className="p-4 bg-white/6 backdrop-blur-sm rounded-xl border border-white/12">
              <div className="flex items-start space-x-3">
                <FiFileText className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white/90 mb-1">
                    Mô tả vụ việc
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed line-clamp-3">
                    {claim.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Amount Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="p-4 bg-gradient-to-r from-red-50/80 to-orange-50/80 rounded-xl border border-red-500/25 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FiDollarSign className="h-4 w-4 text-red-400" />
              <span className="text-sm font-semibold text-red-300">
                Số tiền yêu cầu
              </span>
            </div>
            <p className="text-2xl font-bold text-red-300">
              {formatAmount(claim.claimAmount)} ETH
            </p>
          </div>

          {(claim.status === 4 || claim.status === 6) && (
            <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-green-50/80 rounded-xl border border-emerald-500/25 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <FiCheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">
                  Số tiền được duyệt
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-900">
                {formatAmount(claim.approvedAmount)} ETH
              </p>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-purple-900/15 rounded-lg border border-purple-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiCalendar className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300">
                Ngày nộp
              </span>
            </div>
            <p className="text-sm font-bold text-white">
              {formatDate(claim.submissionDate)}
            </p>
          </div>

          {claim.tenGarage && (
            <div className="p-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-lg border border-amber-500/20/30">
              <div className="flex items-center space-x-2 mb-1">
                <FiShield className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300">
                  Garage sửa chữa
                </span>
              </div>
              <p className="text-sm font-bold text-white">{claim.tenGarage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="relative px-6 py-6 bg-gradient-to-r from-white/5 to-slate-50/50 border-b border-white/10">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <FiZap className="h-5 w-5 text-red-400" />
            <span>Chi Tiết Yêu Cầu</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-white/6 backdrop-blur-sm rounded-xl border border-white/12">
              <p className="text-xs font-semibold text-white/60 mb-1 uppercase tracking-wide">
                Mã yêu cầu
              </p>
              <p className="text-sm font-bold text-white">#{claim.claimId}</p>
            </div>
            <div className="p-4 bg-white/6 backdrop-blur-sm rounded-xl border border-white/12">
              <p className="text-xs font-semibold text-white/60 mb-1 uppercase tracking-wide">
                Mã hợp đồng
              </p>
              <p className="text-sm font-bold text-white">#{claim.policyId}</p>
            </div>
          </div>

          {claim.ipfsDocuments && (
            <div className="p-4 bg-white/6 backdrop-blur-sm rounded-xl border border-white/12 mb-4">
              <p className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">
                Hồ sơ trên IPFS
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80 truncate mr-3">
                  {claim.ipfsDocuments}
                </p>
                <button
                  onClick={handleViewDocuments}
                  disabled={viewingDocuments}
                  className="inline-flex items-center text-red-400 hover:text-red-400 font-semibold text-sm transition-colors whitespace-nowrap"
                >
                  <FiEye className="h-4 w-4 mr-1" />
                  {viewingDocuments ? "Đang tải..." : "Xem hồ sơ"}
                </button>
              </div>
            </div>
          )}

          {/* Paid status info */}
          {claim.status === 6 && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-500/25 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300 mb-1">
                    Đã chi trả bồi thường
                  </h4>
                  <p className="text-sm text-emerald-400">
                    Đã thanh toán {formatAmount(claim.approvedAmount)} ETH vào ví của bạn.
                  </p>
                </div>
              </div>
            </div>
          )}
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
                Ẩn bớt
              </>
            ) : (
              <>
                <FiChevronDown className="h-4 w-4 mr-2" />
                Xem thêm
              </>
            )}
          </button>

          {/* View Documents Button */}
          {claim.ipfsDocuments && (
            <button
              onClick={handleViewDocuments}
              disabled={viewingDocuments}
              className="group/btn inline-flex items-center px-4 py-2.5 border border-white/10 shadow-sm text-sm font-semibold rounded-xl text-white/80 bg-white/8 backdrop-blur-sm hover:bg-white/8 hover:shadow-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 disabled:opacity-50 transition-all duration-200"
            >
              <FiEye className="h-4 w-4 mr-2" />
              {viewingDocuments ? "Đang tải..." : "Xem hồ sơ IPFS"}
            </button>
          )}

          {/* Process Claim Button - dành cho admin */}
          {(claim.status === 0 ||
            claim.status === 1 ||
            claim.status === 2 ||
            claim.status === 3 ||
            claim.status === 4) && onProcess && (
            <button
              onClick={onProcess}
              className="group/btn inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FiFileText className="h-4 w-4 mr-2" />
              Xử lý yêu cầu
            </button>
          )}

          {/* External Link */}
          <button
            onClick={() =>
              window.open(
                `https://etherscan.io/search?q=${claim.claimId}`,
                "_blank"
              )
            }
            className="group/btn inline-flex items-center px-4 py-2.5 border border-white/10 shadow-sm text-sm font-semibold rounded-xl text-white/80 bg-white/8 backdrop-blur-sm hover:bg-white/8 hover:shadow-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 transition-all duration-200"
          >
            <FiExternalLink className="h-4 w-4 mr-2" />
            Blockchain Explorer
          </button>
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
              <span>IPFS bảo mật</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Border Glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${statusGradient} opacity-0 group-hover:opacity-10 transition-all duration-300 pointer-events-none`}
      ></div>
    </div>
  );
};

export default ClaimCard;





