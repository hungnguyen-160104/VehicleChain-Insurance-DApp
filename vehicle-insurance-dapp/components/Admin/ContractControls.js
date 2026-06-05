import { useState, useEffect, useCallback } from "react";
import { useEthersSigner, useEthersProvider } from "../../provider/hooks";
import { contractService } from "../../services/contract";
import {
  FiPause, FiPlay, FiDollarSign, FiSettings, FiAlertTriangle,
  FiDownload, FiShield, FiZap, FiActivity, FiLock, FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";

const LOG_KEY = "vc_admin_action_log";
const MAX_LOG = 20;

function loadLog() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); } catch { return []; }
}

function saveLog(entries) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(0, MAX_LOG)));
}

function pushLog(action, description, status = "success") {
  const entries = loadLog();
  const now = new Date();
  const time = now.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  entries.unshift({ action, description, time, status });
  saveLog(entries);
}

const ContractControls = ({ contractBalance, loading, onRefresh }) => {
  const signer = useEthersSigner();
  const provider = useEthersProvider();
  const [isPaused, setIsPaused] = useState(false);
  const [loadingPauseState, setLoadingPauseState] = useState(true);
  const [pausing, setPausing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [actionLog, setActionLog] = useState([]);

  useEffect(() => {
    setActionLog(loadLog());
  }, []);

  // Đọc trạng thái pause thực từ blockchain khi mount và khi refresh
  useEffect(() => {
    const fetchPauseState = async () => {
      if (!provider) return;
      setLoadingPauseState(true);
      try {
        const paused = await contractService.getIsPaused(provider);
        setIsPaused(paused);
      } catch (err) {
        console.error("Lỗi đọc trạng thái pause:", err);
      } finally {
        setLoadingPauseState(false);
      }
    };
    fetchPauseState();
  }, [provider]);

  const addLog = useCallback((action, description, status = "success") => {
    pushLog(action, description, status);
    setActionLog(loadLog());
  }, []);

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
        // Đọc lại từ blockchain để đảm bảo đồng bộ
        const newPaused = await contractService.getIsPaused(provider);
        setIsPaused(newPaused);
        const msg = newPaused ? "Hợp đồng đã được tạm dừng thành công!" : "Hợp đồng đã được tiếp tục hoạt động!";
        toast.success(msg);
        addLog(newPaused ? "Tạm Dừng Hợp Đồng" : "Tiếp Tục Hợp Đồng", msg);
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
        addLog("Rút Tiền", `Rút ${withdrawAmount} ETH từ quỹ bảo hiểm`);
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
        addLog("Rút Toàn Bộ Quỹ", `Rút toàn bộ ${contractBalance} ETH từ hợp đồng`);
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

    addLog("Xuất Dữ Liệu", "Xuất dữ liệu hợp đồng bảo hiểm thành công");
    toast.success("Xuất dữ liệu hợp đồng thành công!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Điều Khiển Hợp Đồng
          </h2>
          <p className="text-gray-500">
            Kiểm soát khẩn cấp và quản lý quỹ bảo hiểm
          </p>
        </div>
      </div>

      {/* Contract State Control */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 relative">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              {isPaused ? (
                <FiPlay className="h-5 w-5 text-orange-600" />
              ) : (
                <FiPause className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Trạng Thái Hợp Đồng
            </h3>
          </div>

          <div className="space-y-6">
            {/* Current Status Display */}
            <div
              className={`border-2 rounded-2xl p-6 ${
                isPaused
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4
                    className={`text-lg font-bold mb-2 ${
                      isPaused ? "text-red-700" : "text-green-800"
                    }`}
                  >
                    Trạng Thái Hiện Tại
                  </h4>
                  <p
                    className={`text-3xl font-bold mb-2 ${
                      loadingPauseState ? "text-gray-400" : isPaused ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {loadingPauseState ? "Đang kiểm tra..." : isPaused ? "TẠM DỪNG" : "ĐANG HOẠT ĐỘNG"}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isPaused ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isPaused
                      ? "Tất cả tương tác người dùng đã bị vô hiệu hóa"
                      : "Hợp đồng đang vận hành bình thường"}
                  </p>
                </div>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    isPaused ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {isPaused ? (
                    <FiLock className="h-8 w-8 text-red-600" />
                  ) : (
                    <FiShield className="h-8 w-8 text-green-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Pause/Unpause Control */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Kiểm Soát Khẩn Cấp
                  </h4>
                  <p className="text-sm font-medium text-gray-500">
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
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 relative">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <FiDollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Quản Lý Quỹ</h3>
          </div>

          <div className="space-y-8">
            {/* Current Balance Display */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-green-800 mb-2">
                    Số Dư Quỹ Bảo Hiểm
                  </h4>
                  <p className="text-4xl font-bold text-green-600 mb-2">
                    {loading
                      ? "..."
                      : `${parseFloat(contractBalance || 0).toFixed(4)} ETH`}
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    Quỹ dùng để chi trả bồi thường xe cơ giới
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                  <FiDollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Partial Withdrawal */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <FiZap className="h-4 w-4 text-red-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">
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
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 font-medium transition-all duration-300"
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
              <p className="text-sm font-medium text-gray-500 mt-3">
                Số dư khả dụng:{" "}
                <span className="font-bold text-gray-900">
                  {parseFloat(contractBalance || 0).toFixed(4)} ETH
                </span>
              </p>
            </div>

            {/* Full Withdrawal */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <FiAlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <h4 className="text-lg font-bold text-red-700">
                    Rút Toàn Bộ (Khẩn Cấp)
                  </h4>
                </div>

                <p className="text-sm font-medium text-red-600 mb-6">
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
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 relative">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <FiSettings className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Quản Lý Dữ Liệu</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={exportContractData}
              className="inline-flex items-center justify-center px-6 py-4 bg-gray-50 border border-gray-200 shadow-sm text-gray-700 font-semibold rounded-xl hover:bg-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              <FiDownload className="w-5 h-5 mr-3" />
              Xuất Dữ Liệu Hợp Đồng
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-4 bg-gray-50 border border-gray-200 shadow-sm text-gray-700 font-semibold rounded-xl hover:bg-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
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
        <div className="relative z-10 flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <FiShield className="h-6 w-6 text-yellow-600" />
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
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden relative">
        <div className="relative z-10">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <FiActivity className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Hành Động Quản Trị Gần Đây
              </h3>
            </div>
          </div>

          <div className="p-8">
            {actionLog.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FiActivity className="mx-auto mb-2 opacity-30" size={28} />
                <p className="text-sm">Chưa có hành động nào được ghi lại.</p>
                <p className="text-xs mt-1">Log sẽ tự động cập nhật khi bạn thực hiện các thao tác quản trị.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actionLog.map((entry, index) => {
                  const statusConfig = {
                    success: { bg: "bg-green-500", icon: FiShield },
                    warning: { bg: "bg-yellow-500", icon: FiAlertTriangle },
                    error:   { bg: "bg-red-500",   icon: FiAlertTriangle },
                  };
                  const cfg = statusConfig[entry.status] || statusConfig.success;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shadow`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{entry.action}</p>
                          <p className="text-xs text-gray-500">{entry.description}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 flex-shrink-0 ml-4">{entry.time}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractControls;
