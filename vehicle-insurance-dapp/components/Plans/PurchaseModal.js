import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FiX,
  FiCheck,
  FiShield,
  FiCreditCard,
  FiUser,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
  FiTruck,
  FiAlertTriangle,
  FiLock,
} from "react-icons/fi";
import { useEthersSigner } from "../../provider/hooks";
import {
  contractService,
  PAYMENT_TYPES,
  INSURANCE_TYPE_LABELS,
} from "../../services/contract";
import { uploadJSONToPinata } from "../../services/pinata";
import toast from "react-hot-toast";

const PurchaseModal = ({
  isOpen,
  onClose,
  selectedInsuranceType,
  userVehicles = [],
  preselectedBienSo,
  onSuccess,
}) => {
  const signer = useEthersSigner();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  const [formData, setFormData] = useState({
    bienSo: "",
    paymentType: PAYMENT_TYPES.ONE_TIME,
    hoTen: "",
    soDienThoai: "",
    email: "",
    diaChiSoHuu: "",
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCalculatedPrice(null);
      setFormData({
        bienSo: preselectedBienSo || "",
        paymentType: PAYMENT_TYPES.ONE_TIME,
        hoTen: "",
        soDienThoai: "",
        email: "",
        diaChiSoHuu: "",
      });
    }
  }, [isOpen]);

  const insuranceLabel =
    INSURANCE_TYPE_LABELS[selectedInsuranceType] || "Bảo hiểm xe";

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculatePrice = async () => {
    if (!formData.bienSo) {
      toast.error("Vui lòng chọn biển số xe");
      return;
    }
    try {
      setCalculatingPrice(true);
      const fee = await contractService.tinhPhiBaoHiem(
        formData.bienSo,
        selectedInsuranceType,
        formData.paymentType,
        signer?.provider
      );
      if (fee && fee !== "0") {
        setCalculatedPrice(fee);
      } else {
        throw new Error("Không thể tính phí bảo hiểm cho xe này");
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      toast.error(error.message || "Không thể tính phí bảo hiểm");
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.bienSo) {
        toast.error("Vui lòng chọn xe");
        return;
      }
      await handleCalculatePrice();
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);

      const ownerInfo = {
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        email: formData.email,
        diaChiSoHuu: formData.diaChiSoHuu,
        insuranceType: selectedInsuranceType,
        paymentType: formData.paymentType,
        purchaseDate: new Date().toISOString(),
        version: "2.0",
      };

      const ipfsResult = await uploadJSONToPinata(
        ownerInfo,
        `vehicle-insurance-${formData.bienSo}-${Date.now()}.json`
      );

      if (!ipfsResult.success) {
        throw new Error("Không thể tải thông tin lên IPFS");
      }

      const amount = calculatedPrice || 0;

      const result = await contractService.muaBaoHiem(
        formData.bienSo,
        selectedInsuranceType,
        formData.paymentType,
        ipfsResult.ipfsHash,
        amount,
        signer
      );

      if (result.success) {
        toast.success("Mua bảo hiểm thành công!");
        onSuccess && onSuccess();
        onClose();
      } else {
        throw new Error(result.error || "Không thể mua bảo hiểm");
      }
    } catch (error) {
      console.error("Error purchasing insurance:", error);
      toast.error(error.message || "Không thể mua bảo hiểm");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = () => formData.bienSo !== "";
  const isStep3Valid = () =>
    formData.hoTen && formData.soDienThoai && formData.email && formData.diaChiSoHuu;

  const steps = [
    { num: 1, icon: FiTruck, label: "Chọn xe" },
    { num: 2, icon: FiDollarSign, label: "Xác nhận phí" },
    { num: 3, icon: FiUser, label: "Thông tin chủ xe" },
    { num: 4, icon: FiFileText, label: "Xác nhận mua" },
  ];

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
              <Dialog.Panel className="w-full max-w-3xl transform max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-100 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-8 pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <FiShield className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold text-gray-900"
                      >
                        Mua {insuranceLabel}
                      </Dialog.Title>
                      <p className="text-gray-500">
                        Hoàn tất đăng ký bảo hiểm xe của bạn
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

                {/* Progress Bar */}
                <div className="px-8 py-6">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                      ></div>
                    </div>
                    {steps.map(({ num, icon: Icon, label }) => (
                      <div key={num} className="flex flex-col items-center z-10">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-lg transition-all duration-300 ${
                            step >= num
                              ? "bg-red-600 text-white"
                              : "bg-gray-100 border-2 border-gray-200 text-gray-400"
                          }`}
                        >
                          {step > num ? (
                            <FiCheck className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            step >= num ? "text-red-600" : "text-gray-400"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Content */}
                <div className="px-8 pb-8">
                  {/* Step 1: Chọn xe và loại thanh toán */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Chọn Xe Cần Bảo Hiểm
                        </h4>
                        <p className="text-gray-500">
                          Chọn xe và hình thức thanh toán phù hợp
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          <FiTruck className="inline w-4 h-4 mr-2" />
                          Chọn xe *
                        </label>
                        {userVehicles.length === 0 ? (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <div className="flex items-center space-x-2">
                              <FiAlertTriangle className="h-5 w-5 text-yellow-400" />
                              <p className="text-sm text-yellow-800 font-medium">
                                Chưa có xe nào được đăng ký. Vui lòng đăng ký xe trước.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <select
                            value={formData.bienSo}
                            onChange={(e) => handleInputChange("bienSo", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-800 font-medium transition-all duration-300"
                          >
                            <option value="">-- Chọn biển số xe --</option>
                            {userVehicles.map((vehicle) => (
                              <option
                                key={vehicle.bienSo || vehicle}
                                value={vehicle.bienSo || vehicle}
                              >
                                {vehicle.bienSo || vehicle}
                                {vehicle.loaiXeLabel ? ` - ${vehicle.loaiXeLabel}` : ""}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          <FiCreditCard className="inline w-4 h-4 mr-2" />
                          Hình thức thanh toán *
                        </label>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="relative group cursor-pointer">
                            <input
                              type="radio"
                              name="paymentType"
                              value={PAYMENT_TYPES.ONE_TIME}
                              checked={formData.paymentType === PAYMENT_TYPES.ONE_TIME}
                              onChange={() =>
                                handleInputChange("paymentType", PAYMENT_TYPES.ONE_TIME)
                              }
                              className="sr-only"
                            />
                            <div
                              className={`border-2 rounded-2xl p-5 transition-all duration-300 ${
                                formData.paymentType === PAYMENT_TYPES.ONE_TIME
                                  ? "border-red-600 bg-red-50 shadow-lg"
                                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      formData.paymentType === PAYMENT_TYPES.ONE_TIME
                                        ? "bg-red-500/20"
                                        : "bg-gray-100"
                                    }`}
                                  >
                                    <FiCalendar
                                      className={`w-5 h-5 ${
                                        formData.paymentType === PAYMENT_TYPES.ONE_TIME
                                          ? "text-red-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">Một lần/Năm</p>
                                    <p className="text-xs text-gray-500">Trả một lần toàn bộ năm</p>
                                  </div>
                                </div>
                                {formData.paymentType === PAYMENT_TYPES.ONE_TIME && (
                                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                                    <FiCheck className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>

                          <label className="relative group cursor-pointer">
                            <input
                              type="radio"
                              name="paymentType"
                              value={PAYMENT_TYPES.MONTHLY}
                              checked={formData.paymentType === PAYMENT_TYPES.MONTHLY}
                              onChange={() =>
                                handleInputChange("paymentType", PAYMENT_TYPES.MONTHLY)
                              }
                              className="sr-only"
                            />
                            <div
                              className={`border-2 rounded-2xl p-5 transition-all duration-300 ${
                                formData.paymentType === PAYMENT_TYPES.MONTHLY
                                  ? "border-purple-500 bg-purple-50 shadow-lg"
                                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      formData.paymentType === PAYMENT_TYPES.MONTHLY
                                        ? "bg-purple-500/20"
                                        : "bg-gray-100"
                                    }`}
                                  >
                                    <FiCreditCard
                                      className={`w-5 h-5 ${
                                        formData.paymentType === PAYMENT_TYPES.MONTHLY
                                          ? "text-purple-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">Hàng tháng</p>
                                    <p className="text-xs text-gray-500">Gia hạn mỗi 30 ngày</p>
                                  </div>
                                </div>
                                {formData.paymentType === PAYMENT_TYPES.MONTHLY && (
                                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                    <FiCheck className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Xác nhận phí bảo hiểm */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Phí Bảo Hiểm
                        </h4>
                        <p className="text-gray-500">
                          Xem xét phí bảo hiểm trước khi tiếp tục
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Biển số xe:</span>
                            <span className="font-bold text-gray-900">{formData.bienSo}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Loại bảo hiểm:</span>
                            <span className="font-bold text-gray-900">{insuranceLabel}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Hình thức TT:</span>
                            <span className="font-bold text-gray-900">
                              {formData.paymentType === PAYMENT_TYPES.ONE_TIME
                                ? "Một lần/Năm"
                                : "Hàng tháng"}
                            </span>
                          </div>
                          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">
                              Phí bảo hiểm:
                            </span>
                            {calculatingPrice ? (
                              <span className="text-red-500 font-bold">Đang tính...</span>
                            ) : calculatedPrice !== null ? (
                              <span className="text-3xl font-bold text-red-500">
                                {parseFloat(calculatedPrice).toFixed(4)} ETH
                              </span>
                            ) : (
                              <button
                                onClick={handleCalculatePrice}
                                disabled={calculatingPrice}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                              >
                                Tính phí
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <FiShield className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">
                            Phí bảo hiểm được tính tự động từ smart contract dựa trên loại xe
                            và loại bảo hiểm đã chọn.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Thông tin chủ xe */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Thông Tin Chủ Xe
                        </h4>
                        <p className="text-gray-500">
                          Thông tin sẽ được lưu trữ an toàn trên IPFS
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FiUser className="inline w-4 h-4 mr-2" />
                            Họ và tên *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.hoTen}
                            onChange={(e) => handleInputChange("hoTen", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 font-medium transition-all duration-300"
                            placeholder="Nguyễn Văn A"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FiPhone className="inline w-4 h-4 mr-2" />
                            Số điện thoại *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.soDienThoai}
                            onChange={(e) => handleInputChange("soDienThoai", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 font-medium transition-all duration-300"
                            placeholder="0901234567"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FiMail className="inline w-4 h-4 mr-2" />
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 font-medium transition-all duration-300"
                            placeholder="example@email.com"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FiMapPin className="inline w-4 h-4 mr-2" />
                            Địa chỉ sở hữu xe *
                          </label>
                          <textarea
                            required
                            rows="3"
                            value={formData.diaChiSoHuu}
                            onChange={(e) => handleInputChange("diaChiSoHuu", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 font-medium transition-all duration-300 resize-none"
                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Xác nhận và thanh toán */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Xác Nhận Và Thanh Toán
                        </h4>
                        <p className="text-gray-500">
                          Kiểm tra lại thông tin và hoàn tất mua bảo hiểm
                        </p>
                      </div>

                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <FiShield className="h-5 w-5 text-green-600" />
                          </div>
                          <h5 className="text-xl font-bold text-gray-900">Tóm Tắt Hợp Đồng</h5>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div className="flex justify-between col-span-2 border-b border-gray-100 pb-3">
                            <span className="font-medium text-gray-500">Biển số xe:</span>
                            <span className="font-bold text-gray-900">{formData.bienSo}</span>
                          </div>
                          <div className="flex justify-between col-span-2 border-b border-gray-100 pb-3">
                            <span className="font-medium text-gray-500">Loại bảo hiểm:</span>
                            <span className="font-bold text-gray-900">{insuranceLabel}</span>
                          </div>
                          <div className="flex justify-between col-span-2 border-b border-gray-100 pb-3">
                            <span className="font-medium text-gray-500">Hình thức TT:</span>
                            <span className="font-bold text-gray-900">
                              {formData.paymentType === PAYMENT_TYPES.ONE_TIME
                                ? "Một lần/Năm"
                                : "Hàng tháng"}
                            </span>
                          </div>
                          <div className="flex justify-between col-span-2 border-b border-gray-100 pb-3">
                            <span className="font-medium text-gray-500">Chủ xe:</span>
                            <span className="font-bold text-gray-900">{formData.hoTen}</span>
                          </div>
                          <div className="flex justify-between col-span-2 border-b border-gray-100 pb-3">
                            <span className="font-medium text-gray-500">Điện thoại:</span>
                            <span className="font-bold text-gray-900">{formData.soDienThoai}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xl font-bold text-gray-900">Tổng cộng:</span>
                          <span className="text-3xl font-bold text-red-500">
                            {calculatedPrice !== null
                              ? `${parseFloat(calculatedPrice).toFixed(4)} ETH`
                              : "—"}
                            {formData.paymentType === PAYMENT_TYPES.MONTHLY && (
                              <span className="text-lg text-gray-500">/tháng</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
                        <div className="flex items-start space-x-3">
                          <FiAlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-base font-bold text-yellow-900 mb-1">
                              Lưu ý quan trọng
                            </h3>
                            <p className="text-sm font-medium text-yellow-800 leading-relaxed">
                              Bằng cách mua bảo hiểm này, bạn đồng ý với các điều khoản hợp đồng.
                              Thông tin cá nhân sẽ được lưu trữ an toàn trên IPFS và chỉ bạn
                              mới có thể truy cập.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-8 border-t border-gray-100 mt-6">
                    <button
                      type="button"
                      onClick={step === 1 ? onClose : handleBack}
                      className="px-6 py-3 bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                    >
                      {step === 1 ? "Hủy" : "Quay lại"}
                    </button>

                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={
                          (step === 1 && !isStep1Valid()) ||
                          (step === 2 && calculatingPrice) ||
                          (step === 3 && !isStep3Valid())
                        }
                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:bg-red-700 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {step === 2 && calculatingPrice ? "Đang tính..." : "Tiếp theo"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePurchase}
                        disabled={loading}
                        className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Đang xử lý...</span>
                          </>
                        ) : (
                          <>
                            <FiLock className="h-5 w-5" />
                            <span>Xác Nhận Mua Bảo Hiểm</span>
                          </>
                        )}
                      </button>
                    )}
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

export default PurchaseModal;
