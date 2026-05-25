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
      0: "bg-gray-100 text-gray-500 border-gray-200",
      1: "bg-red-50 text-red-600 border-red-200",
      2: "bg-yellow-50 text-yellow-800 border-yellow-200",
      3: "bg-orange-50 text-orange-600 border-orange-200",
      4: "bg-emerald-50 text-emerald-700 border-emerald-200",
      5: "bg-red-50 text-red-600 border-red-200",
      6: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return colors[claim.status] || "bg-gray-100 text-gray-700 border-gray-200";
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
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
      {/* Header */}
      <div className="relative p-6 border-b border-gray-100">
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
              <h3 className="text-xl font-bold text-gray-900">
                Yêu cầu #{claim.claimId}
              </h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-sm text-gray-500">HĐ #{claim.policyId}</p>
                {claim.vehicleBienSo && (
                  <>
                    <span className="text-gray-300">·</span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <FiTruck className="h-3 w-3" />
                      <span>{claim.vehicleBienSo}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-1">
                  <FiShield className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">
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
          <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full">
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
                        : "bg-white border-gray-300 text-gray-400"
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
                      index <= progressIndex ? "text-red-600" : "text-gray-400"
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
                <h4 className="text-sm font-bold text-red-600 mb-1">
                  Yêu cầu bị từ chối
                </h4>
                {claim.lyDoTuChoi && (
                  <p className="text-sm text-red-600">
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
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-start space-x-3">
                <FiFileText className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    Mô tả vụ việc
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {claim.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Amount Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FiDollarSign className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-red-600">
                Số tiền yêu cầu
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatAmount(claim.claimAmount)} ETH
            </p>
          </div>

          {(claim.status === 4 || claim.status === 6) && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <FiCheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-600">
                  Số tiền được duyệt
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">
                {formatAmount(claim.approvedAmount)} ETH
              </p>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-1">
              <FiCalendar className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600">
                Ngày nộp
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {formatDate(claim.submissionDate)}
            </p>
          </div>

          {claim.tenGarage && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-2 mb-1">
                <FiShield className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">
                  Garage sửa chữa
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900">{claim.tenGarage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="relative px-6 py-6 bg-gray-50 border-b border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FiZap className="h-5 w-5 text-red-500" />
            <span>Chi Tiết Yêu Cầu</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Mã yêu cầu
              </p>
              <p className="text-sm font-bold text-gray-900">#{claim.claimId}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Mã hợp đồng
              </p>
              <p className="text-sm font-bold text-gray-900">#{claim.policyId}</p>
            </div>
          </div>

          {claim.ipfsDocuments && (
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Hồ sơ trên IPFS
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 truncate mr-3">
                  {claim.ipfsDocuments}
                </p>
                <button
                  onClick={handleViewDocuments}
                  disabled={viewingDocuments}
                  className="inline-flex items-center text-red-600 hover:text-red-700 font-semibold text-sm transition-colors whitespace-nowrap"
                >
                  <FiEye className="h-4 w-4 mr-1" />
                  {viewingDocuments ? "Đang tải..." : "Xem hồ sơ"}
                </button>
              </div>
            </div>
          )}

          {/* Paid status info */}
          {claim.status === 6 && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-700 mb-1">
                    Đã chi trả bồi thường
                  </h4>
                  <p className="text-sm text-emerald-600">
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
            className="group/btn inline-flex items-center px-4 py-2.5 border border-gray-200 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 transition-all duration-200"
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
              className="group/btn inline-flex items-center px-4 py-2.5 border border-gray-200 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 disabled:opacity-50 transition-all duration-200"
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
            className="group/btn inline-flex items-center px-4 py-2.5 border border-gray-200 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 transition-all duration-200"
          >
            <FiExternalLink className="h-4 w-4 mr-2" />
            Blockchain Explorer
          </button>
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
              <span>IPFS bảo mật</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimCard;
