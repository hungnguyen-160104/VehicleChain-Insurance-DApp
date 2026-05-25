import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FiX,
  FiCheck,
  FiFileText,
  FiAlertTriangle,
  FiEye,
  FiCalendar,
  FiDollarSign,
  FiShield,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useEthersSigner } from "../../provider/hooks";
import { contractService, CLAIM_STATUS } from "../../services/contract";
import toast from "react-hot-toast";

const ProcessClaimModal = ({
  isOpen,
  onClose,
  claim,
  onSuccess,
  isAdmin = false,
}) => {
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [lyDo, setLyDo] = useState("");

  useEffect(() => {
    if (isOpen && claim) {
      setApprovedAmount("");
      setLyDo("");
    }
  }, [isOpen, claim]);

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

  const getStatusBadge = (status) => {
    const styles = {
      0: "bg-gray-100 text-gray-600 border border-gray-200",
      1: "bg-red-50 text-red-700 border border-red-200",
      2: "bg-yellow-50 text-yellow-800 border border-yellow-200",
      3: "bg-orange-50 text-orange-700 border border-orange-200",
      4: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      5: "bg-red-50 text-red-700 border border-red-200",
      6: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  const handleViewDocuments = () => {
    if (claim?.ipfsDocuments) {
      window.open(
        `https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments}`,
        "_blank"
      );
    }
  };

  const handleApprove = async () => {
    if (!claim || !signer) return;
    try {
      setLoading(true);
      const amount = approvedAmount || claim.claimAmount;
      const result = await contractService.adminXuLyClaim(
        claim.claimId,
        true,
        amount,
        "",
        signer
      );
      if (result.success) {
        toast.success("Đã duyệt yêu cầu bồi thường!");
        onSuccess && onSuccess();
        onClose();
      } else {
        throw new Error(result.error || "Không thể duyệt yêu cầu");
      }
    } catch (error) {
      console.error("Error approving claim:", error);
      toast.error(error.message || "Không thể duyệt yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!claim || !signer) return;
    if (!lyDo.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      setLoading(true);
      const result = await contractService.adminXuLyClaim(
        claim.claimId,
        false,
        0,
        lyDo,
        signer
      );
      if (result.success) {
        toast.success("Đã từ chối yêu cầu bồi thường.");
        onSuccess && onSuccess();
        onClose();
      } else {
        throw new Error(result.error || "Không thể từ chối yêu cầu");
      }
    } catch (error) {
      console.error("Error rejecting claim:", error);
      toast.error(error.message || "Không thể từ chối yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleChiTra = async () => {
    if (!claim || !signer) return;
    try {
      setLoading(true);
      const result = await contractService.chiTraBoiThuong(
        claim.claimId,
        signer
      );
      if (result.success) {
        toast.success("Chi trả bồi thường thành công!");
        onSuccess && onSuccess();
        onClose();
      } else {
        throw new Error(result.error || "Không thể chi trả bồi thường");
      }
    } catch (error) {
      console.error("Error paying claim:", error);
      toast.error(error.message || "Không thể chi trả bồi thường");
    } finally {
      setLoading(false);
    }
  };

  // canApproveReject: status 2 (CHO_HO_SO) or 3 (DANG_THAM_DINH)
  const canApproveReject =
    claim?.status === CLAIM_STATUS.CHO_HO_SO ||
    claim?.status === CLAIM_STATUS.DANG_THAM_DINH;

  // canChiTra: status 4 (APPROVED)
  const canChiTra = claim?.status === CLAIM_STATUS.APPROVED;

  if (!claim) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl transition-all">
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                        <FiFileText className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-bold text-gray-900"
                        >
                          Xử Lý Yêu Cầu #{claim.claimId}
                        </Dialog.Title>
                        <p className="text-gray-500">
                          Xem xét và ra quyết định cho yêu cầu bồi thường
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
                      onClick={onClose}
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Claim Overview */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <FiShield className="h-5 w-5 text-purple-500" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">
                          Thông Tin Yêu Cầu
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                          <div className="flex items-center space-x-3">
                            <FiFileText className="h-5 w-5 text-red-500" />
                            <div>
                              <p className="text-xs font-medium text-red-600">Mã yêu cầu</p>
                              <p className="text-lg font-bold text-red-700">#{claim.claimId}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center space-x-3">
                            <FiShield className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="text-xs font-medium text-purple-600">Mã hợp đồng</p>
                              <p className="text-lg font-bold text-purple-900">#{claim.policyId}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                          <div className="flex items-center space-x-3">
                            <FiDollarSign className="h-5 w-5 text-emerald-600" />
                            <div>
                              <p className="text-xs font-medium text-emerald-600">Số tiền yêu cầu</p>
                              <p className="text-lg font-bold text-emerald-700">
                                {formatAmount(claim.claimAmount)} ETH
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {claim.vehicleBienSo && (
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <FiTruck className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-500">Biển số xe</p>
                            </div>
                            <p className="font-bold text-gray-900">{claim.vehicleBienSo}</p>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <FiCalendar className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-500">Ngày nộp</p>
                          </div>
                          <p className="font-medium text-gray-900">
                            {formatDate(claim.submissionDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-500">Trạng thái hiện tại:</p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(claim.status)}`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            claim.status === 1 || claim.status === 2 || claim.status === 3
                              ? "bg-current animate-pulse"
                              : "bg-current"
                          }`}></div>
                          {claim.statusLabel || getStatusLabel(claim.status)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {claim.description && (
                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <h5 className="text-lg font-bold text-gray-900 mb-3">
                          Mô Tả Vụ Việc
                        </h5>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-gray-700 leading-relaxed">{claim.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Garage Info */}
                    {claim.tenGarage && (
                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <h5 className="text-lg font-bold text-gray-900 mb-3">
                          Garage Sửa Chữa
                        </h5>
                        <p className="text-gray-800 font-medium">{claim.tenGarage}</p>
                      </div>
                    )}

                    {/* IPFS Documents */}
                    {claim.ipfsDocuments && (
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                              <FiFileText className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                              <h5 className="font-bold text-red-700 text-lg">
                                Hồ Sơ Chứng Từ (IPFS)
                              </h5>
                              <p className="text-red-500 text-sm">
                                {claim.ipfsDocuments.slice(0, 20)}...
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleViewDocuments}
                            className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-700 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <FiEye className="h-4 w-4 mr-2" />
                            Xem hồ sơ
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && (
                      <>
                        {/* Duyệt / Từ chối */}
                        {canApproveReject && (
                          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                            <h5 className="text-lg font-bold text-gray-900 mb-5">
                              Quyết Định Xử Lý
                            </h5>

                            <div className="space-y-5">
                              {/* Approved Amount */}
                              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
                                <label className="text-sm font-bold text-emerald-700 mb-3 flex items-center space-x-2">
                                  <FiDollarSign className="h-4 w-4" />
                                  <span>Số tiền duyệt (ETH) — để trống để duyệt toàn bộ</span>
                                </label>
                                <input
                                  type="number"
                                  step="0.0001"
                                  min="0"
                                  max={claim.claimAmount}
                                  value={approvedAmount}
                                  onChange={(e) => setApprovedAmount(e.target.value)}
                                  placeholder={`${formatAmount(claim.claimAmount)} (mặc định)`}
                                  className="w-full mt-2 px-4 py-3 bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900"
                                />
                                <p className="text-xs text-emerald-600 mt-2">
                                  Số tiền yêu cầu gốc: {formatAmount(claim.claimAmount)} ETH
                                </p>
                              </div>

                              {/* Lý do từ chối */}
                              <div>
                                <label className="text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                                  <FiX className="h-4 w-4 text-red-500" />
                                  <span>Lý do từ chối (bắt buộc nếu từ chối)</span>
                                </label>
                                <textarea
                                  rows="3"
                                  value={lyDo}
                                  onChange={(e) => setLyDo(e.target.value)}
                                  className="w-full mt-2 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 resize-none text-gray-900"
                                  placeholder="Mô tả lý do từ chối yêu cầu bồi thường..."
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Duyệt */}
                                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
                                  <div className="flex items-start space-x-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                                      <FiCheckCircle className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                      <h6 className="font-bold text-emerald-800">Duyệt yêu cầu</h6>
                                      <p className="text-xs text-emerald-600">
                                        Duyệt {approvedAmount || formatAmount(claim.claimAmount)} ETH
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="w-full py-3 px-4 font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                                  >
                                    {loading ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Đang xử lý...</span>
                                      </>
                                    ) : (
                                      <>
                                        <FiCheck className="h-4 w-4" />
                                        <span>Duyệt Bồi Thường</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* Từ chối */}
                                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                                  <div className="flex items-start space-x-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                                      <FiXCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div>
                                      <h6 className="font-bold text-red-700">Từ chối yêu cầu</h6>
                                      <p className="text-xs text-red-500">
                                        Hành động không thể hoàn tác
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleReject}
                                    disabled={loading || !lyDo.trim()}
                                    className="w-full py-3 px-4 font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                                  >
                                    {loading ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Đang xử lý...</span>
                                      </>
                                    ) : (
                                      <>
                                        <FiX className="h-4 w-4" />
                                        <span>Từ Chối Yêu Cầu</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Warning */}
                              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <div className="flex items-start space-x-3">
                                  <FiAlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-amber-700">
                                    Quyết định duyệt hoặc từ chối sẽ được ghi vĩnh viễn lên blockchain
                                    và không thể thay đổi. Hãy xem xét kỹ hồ sơ trước khi quyết định.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Chi trả bồi thường */}
                        {canChiTra && (
                          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                            <h5 className="text-lg font-bold text-gray-900 mb-4">
                              Chi Trả Bồi Thường
                            </h5>

                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 mb-5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <FiCheckCircle className="h-5 w-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-emerald-800">Yêu cầu đã được duyệt</p>
                                    <p className="text-sm text-emerald-600">
                                      Số tiền: {formatAmount(claim.approvedAmount)} ETH
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleChiTra}
                              disabled={loading}
                              className="w-full py-4 px-6 font-bold text-white text-lg bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                            >
                              {loading ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>Đang xử lý...</span>
                                </>
                              ) : (
                                <>
                                  <FiDollarSign className="h-6 w-6" />
                                  <span>
                                    Chi Trả {formatAmount(claim.approvedAmount)} ETH
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Status info for non-actionable states */}
                        {!canApproveReject && !canChiTra && (
                          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                            <div className="flex items-center space-x-3">
                              <FiShield className="h-5 w-5 text-gray-400" />
                              <p className="text-gray-700 font-medium">
                                Yêu cầu này hiện ở trạng thái{" "}
                                <span className="font-bold text-gray-900">
                                  {claim.statusLabel || getStatusLabel(claim.status)}
                                </span>{" "}
                                — không có hành động quản trị nào khả dụng.
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end pt-8 mt-8 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProcessClaimModal;
