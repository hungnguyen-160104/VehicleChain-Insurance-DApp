import { useState } from "react";
import { useEthersSigner } from "../../provider/hooks";
import { contractService } from "../../services/contract";
import {
  FiPause,
  FiPlay,
  FiDollarSign,
  FiSettings,
  FiAlertTriangle,
  FiDownload,
  FiShield,
  FiZap,
  FiActivity,
  FiLock,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";

const ContractControls = ({ contractBalance, loading, onRefresh }) => {
  const signer = useEthersSigner();
  const [isPaused, setIsPaused] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handlePauseContract = async () => {
    try {
      setPausing(true);

      let result;
      if (isPaused) {
        result = await contractService.unpauseContract(signer);
      } else {
        result = await contractService.pauseContract(signer);
      }

      if (result && result.success) {
        setIsPaused(!isPaused);
        toast.success(
          isPaused
            ? "Hợp đồng đã được tiếp tục hoạt động!"
            : "Hợp đồng đã được tạm dừng thành công!"
        );
        onRefresh && onRefresh();
      } else {
        toast.error(
          result?.error ||
            (isPaused
              ? "Không thể tiếp tục hợp đồng"
              : "Không thể tạm dừng hợp đồng")
        );
      }
    } catch (error) {
      console.error("Lỗi khi tạm dừng/tiếp tục hợp đồng:", error);
      toast.error(error.reason || "Không thể thực hiện thao tác này");
    } finally {
      setPausing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Vui lòng nhập số tiền rút hợp lệ");
      return;
    }

    const balance = parseFloat(contractBalance || "0");
    if (parseFloat(withdrawAmount) > balance) {
      toast.error("Số tiền rút vượt quá số dư hợp đồng");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn rút ${withdrawAmount} ETH từ hợp đồng?`
      )
    ) {
      return;
    }

    try {
      setWithdrawing(true);

      const result = await contractService.rutTien(withdrawAmount, signer);

      if (result && result.success) {
        toast.success(`Rút ${withdrawAmount} ETH thành công!`);
        setWithdrawAmount("");
        onRefresh && onRefresh();
      } else {
        toast.error(result?.error || "Không thể rút tiền");
      }
    } catch (error) {
      console.error("Lỗi khi rút tiền:", error);
      toast.error(error.reason || "Lỗi khi rút tiền từ hợp đồng");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleWithdrawAll = async () => {
    const balance = parseFloat(contractBalance || "0");
    if (balance <= 0) {
      toast.error("Không có tiền để rút");
      return;
    }

    if (
      !window.confirm(
        "Bạn có chắc chắn muốn rút TOÀN BỘ tiền từ hợp đồng? Đây là thao tác không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      setWithdrawing(true);

      const result = await contractService.rutTien(
        contractBalance.toString(),
        signer
      );

      if (result && result.success) {
        toast.success("Rút toàn bộ tiền thành công!");
        setWithdrawAmount("");
        onRefresh && onRefresh();
      } else {
        toast.error(result?.error || "Không thể rút toàn bộ tiền");
      }
    } catch (error) {
      console.error("Lỗi khi rút toàn bộ:", error);
      toast.error(error.reason || "Lỗi khi rút tiền từ hợp đồng");
    } finally {
      setWithdrawing(false);
    }
  };

  const exportContractData = () => {
    const contractData = {
      contractBalance,
      contractStatus: isPaused ? "Tạm dừng" : "Hoạt động",
      timestamp: new Date().toISOString(),
      exportedBy: "Admin",
      note: "Dữ liệu hợp đồng bảo hiểm xe cơ giới",
    };

    const dataStr = JSON.stringify(contractData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `hop-dong-bh-xe-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Xuất dữ liệu hợp đồng thành công!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Điều Khiển Hợp Đồng
          </h2>
          <p className="text-white/60">
            Kiểm soát khẩn cấp và quản lý quỹ bảo hiểm
          </p>
        </div>
      </div>

      {/* Contract State Control */}
      <div className="bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-8 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-50 rounded-full opacity-30"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              {isPaused ? (
                <FiPlay className="h-5 w-5 text-orange-400" />
              ) : (
                <FiPause className="h-5 w-5 text-orange-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white">
              Trạng Thái Hợp Đồng
            </h3>
          </div>

          <div className="space-y-6">
            {/* Current Status Display */}
            <div
              className={`border-2 rounded-2xl p-6 ${
                isPaused
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-500/25"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4
                    className={`text-lg font-bold mb-2 ${
                      isPaused ? "text-red-300" : "text-green-900"
                    }`}
                  >
                    Trạng Thái Hiện Tại
                  </h4>
                  <p
                    className={`text-3xl font-bold mb-2 ${
                      isPaused ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {isPaused ? "TẠM DỪNG" : "ĐANG HOẠT ĐỘNG"}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isPaused ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {isPaused
                      ? "Tất cả tương tác người dùng đã bị vô hiệu hóa"
                      : "Hợp đồng đang vận hành bình thường"}
                  </p>
                </div>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    isPaused ? "bg-red-500/20" : "bg-green-500/20"
                  }`}
                >
                  {isPaused ? (
                    <FiLock className="h-8 w-8 text-red-400" />
                  ) : (
                    <FiShield className="h-8 w-8 text-green-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Pause/Unpause Control */}
            <div className="bg-white/5 border border-white/12 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    Kiểm Soát Khẩn Cấp
                  </h4>
                  <p className="text-sm font-medium text-white/60">
                    {isPaused
                      ? "Tiếp tục hoạt động bình thường của hợp đồng"
                      : "Tạm thời vô hiệu hóa tất cả tương tác hợp đồng"}
                  </p>
                </div>
                <button
                  onClick={handlePauseContract}
                  disabled={pausing}
                  className={`inline-flex items-center px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed ${
                    isPaused
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                      : "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                  }`}
                >
                  {isPaused ? (
                    <FiPlay className="w-4 h-4 mr-2" />
                  ) : (
                    <FiPause className="w-4 h-4 mr-2" />
                  )}
                  {pausing
                    ? isPaused
                      ? "Đang tiếp tục..."
                      : "Đang tạm dừng..."
                    : isPaused
                    ? "Tiếp Tục Hợp Đồng"
                    : "Tạm Dừng Hợp Đồng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fund Management */}
      <div className="bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-8 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-50 rounded-full opacity-30"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <FiDollarSign className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Quản Lý Quỹ</h3>
          </div>

          <div className="space-y-8">
            {/* Current Balance Display */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500/25 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/20 rounded-full opacity-30"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-green-900 mb-2">
                    Số Dư Quỹ Bảo Hiểm
                  </h4>
                  <p className="text-4xl font-bold text-green-400 mb-2">
                    {loading
                      ? "..."
                      : `${parseFloat(contractBalance || 0).toFixed(4)} ETH`}
                  </p>
                  <p className="text-sm font-medium text-green-400">
                    Quỹ dùng để chi trả bồi thường xe cơ giới
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <FiDollarSign className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Partial Withdrawal */}
            <div className="bg-white/5 border border-white/12 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <FiZap className="h-4 w-4 text-red-400" />
                </div>
                <h4 className="text-lg font-bold text-white">
                  Rút Tiền Một Phần
                </h4>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    max={contractBalance}
                    placeholder="Nhập số tiền muốn rút (ETH)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 font-medium transition-all duration-300"
                  />
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={
                    withdrawing ||
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) <= 0
                  }
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-700 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <FiDollarSign className="w-4 h-4 mr-2" />
                  {withdrawing ? "Đang Rút..." : "Rút Tiền"}
                </button>
              </div>
              <p className="text-sm font-medium text-white/60 mt-3">
                Số dư khả dụng:{" "}
                <span className="font-bold text-white">
                  {parseFloat(contractBalance || 0).toFixed(4)} ETH
                </span>
              </p>
            </div>

            {/* Full Withdrawal */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/20 rounded-full opacity-30"></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <FiAlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                  <h4 className="text-lg font-bold text-red-300">
                    Rút Toàn Bộ (Khẩn Cấp)
                  </h4>
                </div>

                <p className="text-sm font-medium text-red-400 mb-6">
                  Rút toàn bộ tiền từ hợp đồng. Chỉ sử dụng trong trường hợp
                  khẩn cấp. Thao tác này không thể hoàn tác.
                </p>

                <button
                  onClick={handleWithdrawAll}
                  disabled={
                    withdrawing || parseFloat(contractBalance || 0) <= 0
                  }
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <FiAlertTriangle className="w-4 h-4 mr-2" />
                  {withdrawing ? "Đang Rút..." : "Rút Toàn Bộ Quỹ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-8 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-full opacity-30"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <FiSettings className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Quản Lý Dữ Liệu</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={exportContractData}
              className="inline-flex items-center justify-center px-6 py-4 bg-white/5 border border-white/12 shadow-lg text-white/80 font-semibold rounded-xl hover:bg-white/8 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <FiDownload className="w-5 h-5 mr-3" />
              Xuất Dữ Liệu Hợp Đồng
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-4 bg-white/5 border border-white/12 shadow-lg text-white/80 font-semibold rounded-xl hover:bg-white/8 hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              <FiRefreshCw
                className={`w-5 h-5 mr-3 ${loading ? "animate-spin" : ""}`}
              />
              Làm Mới Dữ Liệu
            </button>
          </div>
        </div>
      </div>

      {/* Security Guidelines */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full opacity-30"></div>

        <div className="relative z-10 flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <FiShield className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-yellow-900 mb-4">
              Hướng Dẫn Bảo Mật
            </h3>
            <div className="text-sm font-medium text-yellow-800 space-y-2">
              {[
                "Chỉ sử dụng kiểm soát khẩn cấp khi thực sự cần thiết",
                "Tạm dừng hợp đồng sẽ ngăn chặn tất cả tương tác của người dùng",
                "Giao dịch rút tiền không thể hoàn tác — kiểm tra kỹ số tiền trước khi xác nhận",
                "Theo dõi hoạt động hợp đồng thường xuyên để phát hiện bất thường",
                "Lưu giữ hồ sơ tất cả các hành động quản trị",
                "Đảm bảo quỹ đủ để chi trả các yêu cầu bồi thường đang chờ xử lý",
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Admin Actions */}
      <div className="bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-red-50 rounded-full opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-900/20 to-red-900/15 rounded-full opacity-20"></div>

        <div className="relative z-10">
          <div className="px-8 py-6 border-b border-white/12">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <FiActivity className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Hành Động Quản Trị Gần Đây
              </h3>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              {[
                {
                  action: "Rút Tiền",
                  description: "Rút 0.5 ETH từ quỹ bảo hiểm",
                  timestamp: "2 giờ trước",
                  status: "success",
                  icon: FiDollarSign,
                },
                {
                  action: "Cấp Quyền Garage",
                  description: "Garage mới được cấp quyền giám định",
                  timestamp: "1 ngày trước",
                  status: "success",
                  icon: FiShield,
                },
                {
                  action: "Chi Trả Bồi Thường",
                  description: "Chi trả thành công cho yêu cầu bồi thường #5",
                  timestamp: "3 ngày trước",
                  status: "success",
                  icon: FiSettings,
                },
                {
                  action: "Tạm Dừng Hợp Đồng",
                  description: "Tạm dừng hợp đồng để bảo trì",
                  timestamp: "1 tuần trước",
                  status: "warning",
                  icon: FiLock,
                },
              ].map((action, index) => {
                const statusConfig = {
                  success: { bg: "bg-green-500" },
                  warning: { bg: "bg-yellow-500" },
                  error: { bg: "bg-red-500" },
                };
                const config = statusConfig[action.status];

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/12 rounded-2xl hover:bg-white transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shadow-lg`}
                      >
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{action.action}</p>
                        <p className="text-sm text-white/60 font-medium">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-white/50">
                      {action.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractControls;






