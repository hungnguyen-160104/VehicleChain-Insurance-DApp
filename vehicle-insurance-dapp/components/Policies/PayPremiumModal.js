import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FiX,
  FiCreditCard,
  FiCalendar,
  FiDollarSign,
  FiShield,
  FiTruck,
  FiAlertTriangle,
  FiCheck,
  FiInfo,
} from "react-icons/fi";
import { useEthersSigner } from "../../provider/hooks";
import { contractService } from "../../services/contract";
import toast from "react-hot-toast";

const PayPremiumModal = ({ isOpen, onClose, policy, onSuccess }) => {
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === "0") return "N/A";
    const ts = parseInt(timestamp);
    const date = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    return date.toLocaleDateString("vi-VN");
  };

  const getNewEndDate = () => {
    if (!policy?.endDate) return "N/A";
    const ts = parseInt(policy.endDate);
    const currentEnd = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    const newEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
    return newEnd.toLocaleDateString("vi-VN");
  };

  const isExpired = () => {
    if (!policy?.endDate) return false;
    const ts = parseInt(policy.endDate);
    const expiryDate = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    return new Date() > expiryDate;
  };

  const getDaysOverdue = () => {
    if (!policy?.endDate || !isExpired()) return 0;
    const ts = parseInt(policy.endDate);
    const expiryDate = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    return Math.ceil((new Date() - expiryDate) / (1000 * 60 * 60 * 24));
  };

  const handleGiaHan = async () => {
    if (!policy || !signer) return;

    try {
      setLoading(true);

      const result = await contractService.giaHanHangThang(
        policy.policyId,
        signer
      );

      if (result.success) {
        toast.success("Gia hạn hợp đồng thành công! Thêm 30 ngày.");
        onSuccess && onSuccess();
        onClose();
      } else {
        throw new Error(result.error || "Không thể gia hạn hợp đồng");
      }
    } catch (error) {
      console.error("Error renewing policy:", error);
      toast.error(error.message || "Không thể gia hạn hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  if (!policy) return null;

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
          <div className="fixed inset-0 bg-black bg-opacity-40" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-white/12">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <FiCreditCard className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-bold text-white"
                      >
                        Gia Hạn Hợp Đồng
                      </Dialog.Title>
                      <p className="text-sm text-white/60">
                        Gia hạn thêm 30 ngày
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl text-white/40 hover:text-white/50 hover:bg-white/8 p-2 transition-colors"
                    onClick={onClose}
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Policy Details */}
                  <div className="bg-white/5 rounded-xl p-5">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                        <FiTruck className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {policy.vehicleBienSo || "Biển số N/A"}
                        </h4>
                        <p className="text-sm text-white/50">
                          {policy.insuranceTypeLabel || "N/A"} · HĐ #{policy.policyId}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50 flex items-center space-x-1">
                          <FiDollarSign className="h-4 w-4" />
                          <span>Phí gia hạn:</span>
                        </span>
                        <span className="font-bold text-white">
                          {parseFloat(policy.premium || 0).toFixed(4)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50 flex items-center space-x-1">
                          <FiCalendar className="h-4 w-4" />
                          <span>Hạn hiện tại:</span>
                        </span>
                        <span className={`font-bold ${isExpired() ? "text-red-400" : "text-white"}`}>
                          {formatDate(policy.endDate)}
                          {isExpired() && " (Đã hết hạn)"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50 flex items-center space-x-1">
                          <FiCalendar className="h-4 w-4" />
                          <span>Hạn mới sau gia hạn:</span>
                        </span>
                        <span className="font-bold text-green-400">
                          {getNewEndDate()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overdue Warning */}
                  {isExpired() && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <FiAlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-bold text-red-300">
                            Hợp đồng đã hết hạn
                          </h3>
                          <p className="text-sm text-red-400 mt-1">
                            Hợp đồng đã hết hạn {getDaysOverdue()} ngày. Gia hạn ngay để duy trì
                            bảo vệ cho xe của bạn.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div className="border border-white/12 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                      <FiShield className="h-4 w-4 text-red-400" />
                      <span>Chi tiết thanh toán</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Phí gia hạn 30 ngày</span>
                        <span className="font-medium">
                          {parseFloat(policy.premium || 0).toFixed(4)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between text-white/50">
                        <span>Phí gas (ước tính)</span>
                        <span>~0.001 ETH</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-emerald-400">
                          {parseFloat(policy.premium || 0).toFixed(4)} ETH
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <FiInfo className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-red-300 mb-1">
                          Thông tin gia hạn
                        </h3>
                        <ul className="text-sm text-red-400 space-y-1">
                          <li className="flex items-center space-x-1">
                            <FiCheck className="h-3 w-3" />
                            <span>Gia hạn thêm 30 ngày từ ngày hết hạn hiện tại</span>
                          </li>
                          <li className="flex items-center space-x-1">
                            <FiCheck className="h-3 w-3" />
                            <span>Có thể nộp yêu cầu bồi thường ngay sau gia hạn</span>
                          </li>
                          <li className="flex items-center space-x-1">
                            <FiCheck className="h-3 w-3" />
                            <span>Giao dịch được xác thực trên blockchain</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-white/80 bg-white/8 border border-white/15 rounded-xl hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleGiaHan}
                      disabled={loading}
                      className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 border border-transparent rounded-xl hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <FiCreditCard className="h-4 w-4" />
                          <span>Gia Hạn {parseFloat(policy.premium || 0).toFixed(4)} ETH</span>
                        </>
                      )}
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

export default PayPremiumModal;




