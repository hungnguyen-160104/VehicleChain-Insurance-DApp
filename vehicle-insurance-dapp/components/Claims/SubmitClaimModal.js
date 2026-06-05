import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FiX,
  FiUpload,
  FiCheck,
  FiFileText,
  FiAlertTriangle,
  FiShield,
  FiLock,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiTruck,
  FiMapPin,
} from "react-icons/fi";
import { useEthersSigner } from "../../provider/hooks";
import { contractService, POLICY_STATUS } from "../../services/contract";
import { uploadToPinata, uploadJSONToPinata } from "../../services/pinata";
import toast from "react-hot-toast";

const SubmitClaimModal = ({ isOpen, onClose, policies = [], onSuccess }) => {
  const signer = useEthersSigner();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [documents, setDocuments] = useState([]);

  const [formData, setFormData] = useState({
    policyId: "",
    claimAmount: "",
    description: "",
    claimType: "",
    ngayXayRa: "",
    diaChiXayRa: "",
  });

  const activePolicies = policies.filter(
    (p) => p.status === POLICY_STATUS.ACTIVE
  );

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setDocuments([]);
      setFormData({
        policyId: "",
        claimAmount: "",
        description: "",
        claimType: "",
        ngayXayRa: "",
        diaChiXayRa: "",
      });
    }
  }, [isOpen]);

  const selectedPolicy = policies.find(
    (p) => String(p.policyId) === String(formData.policyId)
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingDocuments(true);
    const uploadedFiles = [];

    try {
      for (const file of files) {
        const result = await uploadToPinata(file, {
          name: `claim-doc-${Date.now()}-${file.name}`,
          keyvalues: {
            type: "claim-document",
            fileName: file.name,
          },
        });

        if (result.success) {
          uploadedFiles.push({
            name: file.name,
            ipfsHash: result.ipfsHash,
            url: result.url,
            size: file.size,
          });
        }
      }

      setDocuments((prev) => [...prev, ...uploadedFiles]);
      toast.success(`Đã tải lên ${uploadedFiles.length} tài liệu thành công`);
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Không thể tải tài liệu lên IPFS");
    } finally {
      setUploadingDocuments(false);
    }
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmitClaim = async () => {
    try {
      setLoading(true);

      // Upload metadata + documents to IPFS
      const claimMetadata = {
        policyId: formData.policyId,
        claimAmount: formData.claimAmount,
        description: formData.description,
        claimType: formData.claimType,
        ngayXayRa: formData.ngayXayRa,
        diaChiXayRa: formData.diaChiXayRa,
        documents: documents,
        submissionDate: new Date().toISOString(),
        version: "2.0",
      };

      const metadataResult = await uploadJSONToPinata(
        claimMetadata,
        `claim-metadata-${formData.policyId}-${Date.now()}.json`
      );

      if (!metadataResult.success) {
        throw new Error("Không thể tải metadata lên IPFS");
      }

      const result = await contractService.yeuCauBoiThuong(
        formData.policyId,
        formData.claimAmount,
        metadataResult.ipfsHash,
        formData.description,
        signer
      );

      if (result.success) {
        toast.success("Nộp yêu cầu bồi thường thành công!");
        onSuccess && onSuccess();
        onClose();
      } else {
        throw new Error(result.error || "Không thể nộp yêu cầu bồi thường");
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast.error(error.message || "Không thể nộp yêu cầu bồi thường");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = () => formData.policyId !== "";
  const isStep2Valid = () =>
    formData.claimAmount &&
    formData.description &&
    formData.claimType &&
    formData.ngayXayRa &&
    formData.diaChiXayRa;

  const steps = [
    { number: 1, title: "Chọn hợp đồng", icon: FiShield },
    { number: 2, title: "Thông tin vụ việc", icon: FiFileText },
    { number: 3, title: "Tài liệu", icon: FiUpload },
    { number: 4, title: "Xác nhận", icon: FiCheckCircle },
  ];

  const claimTypeLabels = {
    tai_nan_va_cham: "Tai nạn va chạm",
    trom_cuop: "Trộm cướp",
    thien_tai: "Thiên tai",
    hu_hong_may: "Hư hỏng máy móc",
    khac: "Khác",
  };

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
              <Dialog.Panel className="w-full max-w-4xl transform max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-100 p-4 sm:p-8 text-left align-middle transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FiFileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold text-gray-900"
                      >
                        Nộp Yêu Cầu Bồi Thường
                      </Dialog.Title>
                      <p className="text-gray-500">
                        Quy trình xử lý minh bạch trên blockchain
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-200 bg-gray-100 p-2 transition-colors"
                    onClick={onClose}
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-10">
                  <div className="flex items-center justify-between relative z-10">
                    {steps.map((stepItem) => {
                      const StepIcon = stepItem.icon;
                      const isActive = step >= stepItem.number;
                      const isCompleted = step > stepItem.number;

                      return (
                        <div
                          key={stepItem.number}
                          className="flex flex-col items-center relative z-10"
                        >
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                              isActive
                                ? "bg-gradient-to-br from-red-600 to-orange-500 border-red-600 text-white shadow-lg"
                                : "bg-gray-100 border-gray-200 text-gray-400"
                            }`}
                          >
                            {isCompleted ? (
                              <FiCheck className="w-5 h-5" />
                            ) : (
                              <StepIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="mt-3 text-center">
                            <p
                              className={`text-xs font-semibold ${
                                isActive ? "text-red-600" : "text-gray-400"
                              }`}
                            >
                              Bước {stepItem.number}
                            </p>
                            <p
                              className={`text-xs ${
                                isActive ? "text-gray-900" : "text-gray-400"
                              }`}
                            >
                              {stepItem.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Progress Line */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="min-h-[400px]">
                  {/* Step 1: Chọn hợp đồng */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Chọn Hợp Đồng Bảo Hiểm
                        </h4>
                        <p className="text-gray-500">
                          Chọn hợp đồng xe cần nộp yêu cầu bồi thường
                        </p>
                      </div>

                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        {activePolicies.length === 0 ? (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <div className="flex items-center space-x-2">
                              <FiAlertTriangle className="h-5 w-5 text-yellow-400" />
                              <p className="text-sm text-yellow-800 font-medium">
                                Không có hợp đồng nào đang hiệu lực. Vui lòng mua bảo hiểm trước.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                              <FiShield className="h-4 w-4" />
                              <span>Chọn hợp đồng *</span>
                            </label>
                            {activePolicies.map((policy) => (
                              <label
                                key={policy.policyId}
                                className="relative group cursor-pointer block"
                              >
                                <input
                                  type="radio"
                                  name="policyId"
                                  value={policy.policyId}
                                  checked={
                                    String(formData.policyId) ===
                                    String(policy.policyId)
                                  }
                                  onChange={(e) =>
                                    handleInputChange("policyId", e.target.value)
                                  }
                                  className="sr-only"
                                />
                                <div
                                  className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                                    String(formData.policyId) ===
                                    String(policy.policyId)
                                      ? "border-red-600 bg-red-50 shadow-lg"
                                      : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                          String(formData.policyId) ===
                                          String(policy.policyId)
                                            ? "bg-red-500/20"
                                            : "bg-gray-100"
                                        }`}
                                      >
                                        <FiTruck
                                          className={`w-5 h-5 ${
                                            String(formData.policyId) ===
                                            String(policy.policyId)
                                              ? "text-red-400"
                                              : "text-gray-400"
                                          }`}
                                        />
                                      </div>
                                      <div>
                                        <p className="font-bold text-gray-900">
                                          {policy.vehicleBienSo || "N/A"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {policy.insuranceTypeLabel} · HĐ #{policy.policyId}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">Hạn mức còn lại</p>
                                      <p className="font-bold text-emerald-700 text-sm">
                                        {parseFloat(
                                          parseFloat(policy.coverageAmount || 0) -
                                          parseFloat(policy.claimsUsed || 0)
                                        ).toFixed(4)} ETH
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Thông tin vụ việc */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Thông Tin Vụ Tai Nạn
                        </h4>
                        <p className="text-gray-500">
                          Cung cấp thông tin chi tiết về sự cố xảy ra
                        </p>
                      </div>

                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                              <FiDollarSign className="h-4 w-4" />
                              <span>Số tiền yêu cầu (ETH) *</span>
                            </label>
                            <input
                              type="number"
                              step="0.0001"
                              min="0"
                              required
                              value={formData.claimAmount}
                              onChange={(e) =>
                                handleInputChange("claimAmount", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 bg-white text-gray-900 text-sm font-medium"
                              placeholder="0.0000"
                            />
                          </div>

                          <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                              <FiFileText className="h-4 w-4" />
                              <span>Loại sự cố *</span>
                            </label>
                            <select
                              value={formData.claimType}
                              onChange={(e) =>
                                handleInputChange("claimType", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 bg-gray-50 text-gray-800 text-sm font-medium"
                              required
                            >
                              <option value="">-- Chọn loại sự cố --</option>
                              <option value="tai_nan_va_cham">Tai nạn va chạm</option>
                              <option value="trom_cuop">Trộm cướp</option>
                              <option value="thien_tai">Thiên tai</option>
                              <option value="hu_hong_may">Hư hỏng máy móc</option>
                              <option value="khac">Khác</option>
                            </select>
                          </div>

                          <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                              <FiCalendar className="h-4 w-4" />
                              <span>Ngày xảy ra sự cố *</span>
                            </label>
                            <input
                              type="date"
                              required
                              value={formData.ngayXayRa}
                              onChange={(e) =>
                                handleInputChange("ngayXayRa", e.target.value)
                              }
                              max={new Date().toISOString().split("T")[0]}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 bg-white text-gray-900 text-sm font-medium"
                            />
                          </div>

                          <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                              <FiMapPin className="h-4 w-4" />
                              <span>Địa chỉ xảy ra sự cố *</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.diaChiXayRa}
                              onChange={(e) =>
                                handleInputChange("diaChiXayRa", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 bg-white text-gray-900 text-sm font-medium"
                              placeholder="Số nhà, đường, phường/xã, quận/huyện"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                              <FiFileText className="h-4 w-4" />
                              <span>Mô tả vụ tai nạn *</span>
                            </label>
                            <textarea
                              rows="4"
                              required
                              value={formData.description}
                              onChange={(e) =>
                                handleInputChange("description", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 bg-white text-gray-900 text-sm font-medium resize-none"
                              placeholder="Mô tả chi tiết về vụ tai nạn, thiệt hại, hoàn cảnh xảy ra..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Policy Info */}
                      {selectedPolicy && (
                        <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-500/25 rounded-2xl p-5">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FiShield className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-red-700 mb-2">
                                Thông tin hợp đồng được chọn
                              </h3>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-red-600 font-semibold">Xe:</span>
                                  <span className="ml-2 text-red-700 font-bold">
                                    {selectedPolicy.vehicleBienSo}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-red-600 font-semibold">Hạn mức còn lại:</span>
                                  <span className="ml-2 text-emerald-700 font-bold">
                                    {parseFloat(
                                      parseFloat(selectedPolicy.coverageAmount || 0) -
                                      parseFloat(selectedPolicy.claimsUsed || 0)
                                    ).toFixed(4)} ETH
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Upload tài liệu */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Tải Lên Hồ Sơ Chứng Từ
                        </h4>
                        <p className="text-gray-500">
                          Ảnh hiện trường, biên bản tai nạn, hóa đơn sửa xe
                        </p>
                      </div>

                      {/* File Upload */}
                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <div className="flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 transition-colors group">
                          <div className="space-y-2 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                              <FiUpload className="h-8 w-8 text-red-400" />
                            </div>
                            <div className="flex text-sm text-gray-500 justify-center">
                              <label
                                htmlFor="claim-file-upload"
                                className="relative cursor-pointer bg-gray-100 rounded-xl font-bold text-red-500 hover:text-red-600 px-3 py-1 transition-colors"
                              >
                                <span>Chọn tập tin</span>
                                <input
                                  id="claim-file-upload"
                                  name="claim-file-upload"
                                  type="file"
                                  multiple
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  className="sr-only"
                                  onChange={handleFileUpload}
                                  disabled={uploadingDocuments}
                                />
                              </label>
                              <p className="pl-1">hoặc kéo thả vào đây</p>
                            </div>
                            <p className="text-xs text-gray-400 font-medium">
                              Ảnh hiện trường (JPG/PNG), Biên bản (PDF/DOC), Hóa đơn (PDF) · Tối đa 10MB/file
                            </p>
                            {uploadingDocuments && (
                              <p className="text-sm text-red-400 font-medium animate-pulse">
                                Đang tải lên IPFS...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Uploaded Documents */}
                      {documents.length > 0 && (
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                          <h5 className="text-base font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <FiFileText className="h-5 w-5 text-red-400" />
                            <span>Đã tải lên ({documents.length} tập tin)</span>
                          </h5>
                          <div className="space-y-3">
                            {documents.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm"
                              >
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FiFileText className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                      {doc.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(doc.size)} · IPFS: {doc.ipfsHash?.slice(0, 12)}...
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeDocument(index)}
                                  className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors ml-2 flex-shrink-0"
                                >
                                  <FiX className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {documents.length === 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <FiAlertTriangle className="h-5 w-5 text-amber-500" />
                            <p className="text-sm text-amber-700 font-medium">
                              Khuyến nghị tải lên ít nhất 1 tài liệu chứng minh để tăng tỷ lệ được duyệt.
                              Bạn vẫn có thể tiếp tục mà không cần tài liệu.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Xác nhận */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Xác Nhận Nộp Yêu Cầu
                        </h4>
                        <p className="text-gray-500">
                          Kiểm tra lại thông tin trước khi gửi
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <h5 className="text-base font-bold text-gray-900 mb-5 flex items-center space-x-2">
                          <FiCheckCircle className="h-5 w-5 text-green-500" />
                          <span>Tóm Tắt Yêu Cầu</span>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                            <p className="text-sm font-semibold text-red-600 mb-1">Hợp đồng</p>
                            <p className="font-bold text-gray-900">
                              {selectedPolicy?.vehicleBienSo || "N/A"} · #{formData.policyId}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                            <p className="text-sm font-semibold text-emerald-700 mb-1">Số tiền yêu cầu</p>
                            <p className="font-bold text-gray-900">{formData.claimAmount} ETH</p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                            <p className="text-sm font-semibold text-purple-600 mb-1">Loại sự cố</p>
                            <p className="font-bold text-gray-900">
                              {claimTypeLabels[formData.claimType] || formData.claimType}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                            <p className="text-sm font-semibold text-amber-600 mb-1">Ngày xảy ra</p>
                            <p className="font-bold text-gray-900">{formData.ngayXayRa || "N/A"}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
                            <p className="text-sm font-semibold text-gray-500 mb-1">Địa điểm</p>
                            <p className="font-bold text-gray-900">{formData.diaChiXayRa}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                            <p className="text-sm font-semibold text-rose-600 mb-1">Tài liệu đính kèm</p>
                            <p className="font-bold text-gray-900">{documents.length} tập tin</p>
                          </div>
                        </div>
                      </div>

                      {/* Important Notice */}
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FiAlertTriangle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-amber-700 mb-1">
                              Lưu ý quan trọng
                            </h3>
                            <p className="text-sm text-amber-700 leading-relaxed">
                              Bằng cách nộp yêu cầu này, bạn xác nhận tất cả thông tin là chính xác và trung thực.
                              Cung cấp thông tin sai lệch có thể dẫn đến hủy hợp đồng và hậu quả pháp lý.
                              Dữ liệu sẽ được lưu trên IPFS và xử lý qua smart contract.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-8 mt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={step === 1 ? onClose : () => setStep(step - 1)}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200"
                  >
                    {step === 1 ? "Hủy" : "Quay lại"}
                  </button>

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      disabled={
                        (step === 1 && !isStep1Valid()) ||
                        (step === 2 && !isStep2Valid()) ||
                        uploadingDocuments
                      }
                      className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-700 to-orange-600 border border-transparent rounded-xl hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Tiếp theo
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitClaim}
                      disabled={loading || uploadingDocuments}
                      className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 border border-transparent rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Đang nộp...</span>
                        </>
                      ) : (
                        <>
                          <FiLock className="h-4 w-4" />
                          <span>Nộp Yêu Cầu Bồi Thường</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SubmitClaimModal;
