import { useState, useEffect } from "react";
import { useEthersSigner } from "../../provider/hooks";
import { contractService } from "../../services/contract";
import {
  FiTruck,
  FiUserPlus,
  FiUserX,
  FiCheck,
  FiShield,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

const GarageManagement = () => {
  const signer = useEthersSigner();
  const [garageAddress, setGarageAddress] = useState("");
  const [authorizing, setAuthorizing] = useState(false);
  const [revokingAddress, setRevokingAddress] = useState(null);
  const [garages, setGarages] = useState([]);

  // Load garages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("authorizedGarages");
    if (saved) {
      try {
        setGarages(JSON.parse(saved));
      } catch {
        setGarages([]);
      }
    }
  }, []);

  const saveGarages = (list) => {
    setGarages(list);
    localStorage.setItem("authorizedGarages", JSON.stringify(list));
  };

  const handleCapQuyen = async () => {
    if (!garageAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ ví của garage");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(garageAddress.trim())) {
      toast.error("Địa chỉ Ethereum không hợp lệ");
      return;
    }

    const normalizedAddress = garageAddress.trim().toLowerCase();

    if (
      garages.some(
        (g) => g.address.toLowerCase() === normalizedAddress && g.isActive
      )
    ) {
      toast.error("Garage này đã được cấp quyền");
      return;
    }

    try {
      setAuthorizing(true);
      const result = await contractService.capQuyenGarage(
        garageAddress.trim(),
        true,
        signer
      );

      if (result && result.success) {
        toast.success("Cấp quyền garage thành công!");

        const newGarage = {
          address: garageAddress.trim(),
          isActive: true,
          authorizedDate: new Date().toISOString(),
          transactionHash: result.transactionHash || "",
        };

        // Update or add to list
        const existingIndex = garages.findIndex(
          (g) => g.address.toLowerCase() === normalizedAddress
        );
        let updatedList;
        if (existingIndex >= 0) {
          updatedList = [...garages];
          updatedList[existingIndex] = newGarage;
        } else {
          updatedList = [newGarage, ...garages];
        }

        saveGarages(updatedList);
        setGarageAddress("");
      } else {
        toast.error(result?.error || "Không thể cấp quyền garage");
      }
    } catch (error) {
      console.error("Lỗi khi cấp quyền garage:", error);
      toast.error(error.reason || "Lỗi khi cấp quyền garage");
    } finally {
      setAuthorizing(false);
    }
  };

  const handleThuHoi = async (address) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn thu hồi quyền của garage ${formatAddress(address)}?`
      )
    ) {
      return;
    }

    try {
      setRevokingAddress(address);
      const result = await contractService.capQuyenGarage(
        address,
        false,
        signer
      );

      if (result && result.success) {
        toast.success("Thu hồi quyền garage thành công!");
        const updatedList = garages.map((g) =>
          g.address.toLowerCase() === address.toLowerCase()
            ? { ...g, isActive: false, revokedDate: new Date().toISOString() }
            : g
        );
        saveGarages(updatedList);
      } else {
        toast.error(result?.error || "Không thể thu hồi quyền garage");
      }
    } catch (error) {
      console.error("Lỗi khi thu hồi quyền:", error);
      toast.error(error.reason || "Lỗi khi thu hồi quyền garage");
    } finally {
      setRevokingAddress(null);
    }
  };

  const handleCapLai = async (address) => {
    try {
      setRevokingAddress(address);
      const result = await contractService.capQuyenGarage(
        address,
        true,
        signer
      );

      if (result && result.success) {
        toast.success("Cấp lại quyền garage thành công!");
        const updatedList = garages.map((g) =>
          g.address.toLowerCase() === address.toLowerCase()
            ? {
                ...g,
                isActive: true,
                authorizedDate: new Date().toISOString(),
                revokedDate: undefined,
              }
            : g
        );
        saveGarages(updatedList);
      } else {
        toast.error(result?.error || "Không thể cấp lại quyền");
      }
    } catch (error) {
      console.error("Lỗi khi cấp lại quyền:", error);
      toast.error(error.reason || "Lỗi khi cấp lại quyền garage");
    } finally {
      setRevokingAddress(null);
    }
  };

  const handleRemoveFromList = (address) => {
    const updatedList = garages.filter(
      (g) => g.address.toLowerCase() !== address.toLowerCase()
    );
    saveGarages(updatedList);
    toast.success("Đã xóa khỏi danh sách");
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const activeGarages = garages.filter((g) => g.isActive);
  const inactiveGarages = garages.filter((g) => !g.isActive);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Garage</h2>
          <p className="text-gray-500">
            Cấp quyền và quản lý các garage giám định xe
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: FiTruck,
            title: "Tổng Garage",
            value: garages.length,
            bg: "from-red-50 to-orange-50",
            text: "text-red-600",
          },
          {
            icon: FiCheck,
            title: "Đang Hoạt Động",
            value: activeGarages.length,
            bg: "from-emerald-100 to-green-100",
            text: "text-emerald-600",
          },
          {
            icon: FiUserX,
            title: "Đã Thu Hồi",
            value: inactiveGarages.length,
            bg: "from-red-100 to-pink-100",
            text: "text-red-600",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 overflow-hidden group hover:shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`h-6 w-6 ${stat.text}`} />
              </div>
              <div className="ml-4">
                <div className="text-sm font-bold text-gray-500">{stat.title}</div>
                <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Garage */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <FiUserPlus className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Cấp Quyền Garage Mới
            </h3>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nhập địa chỉ ví Ethereum của garage (0x...)"
                value={garageAddress}
                onChange={(e) => setGarageAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCapQuyen()}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 font-medium transition-all duration-300"
              />
            </div>
            <button
              onClick={handleCapQuyen}
              disabled={authorizing || !garageAddress.trim()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-700 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              <FiUserPlus className="w-4 h-4 mr-2" />
              {authorizing ? "Đang Cấp Quyền..." : "Cấp Quyền"}
            </button>
          </div>
          <p className="text-sm font-medium text-gray-500 mt-4">
            Nhập địa chỉ ví Ethereum của garage. Garage được cấp quyền có thể
            cập nhật trạng thái giám định cho yêu cầu bồi thường.
          </p>
        </div>
      </div>

      {/* Garage List */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <FiTruck className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Danh Sách Garage ({garages.length})
            </h3>
          </div>
        </div>

        {garages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <FiTruck className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có garage nào
            </h3>
            <p className="text-gray-500">
              Bắt đầu bằng cách cấp quyền cho garage đầu tiên.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {garages.map((garage, index) => {
              const isRevoking = revokingAddress === garage.address;
              return (
                <div
                  key={garage.address}
                  className="p-6 hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg ${
                          garage.isActive
                            ? "bg-gradient-to-r from-red-600 to-purple-600"
                            : "bg-gradient-to-r from-gray-400 to-gray-500"
                        }`}
                      >
                        <FiTruck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-0.5">
                          Garage #{index + 1}
                        </h4>
                        <p className="font-mono text-sm text-gray-500 font-semibold">
                          {formatAddress(garage.address)}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {garage.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right mr-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold border ${
                            garage.isActive
                              ? "bg-green-50 text-green-600 border-green-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          {garage.isActive ? "Hoạt Động" : "Đã Thu Hồi"}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          {garage.isActive
                            ? `Cấp: ${new Date(garage.authorizedDate).toLocaleDateString("vi-VN")}`
                            : garage.revokedDate
                            ? `Thu hồi: ${new Date(garage.revokedDate).toLocaleDateString("vi-VN")}`
                            : ""}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {garage.isActive ? (
                          <button
                            onClick={() => handleThuHoi(garage.address)}
                            disabled={isRevoking}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none"
                          >
                            <FiUserX className="w-4 h-4 mr-1.5" />
                            {isRevoking ? "Đang xử lý..." : "Thu Hồi"}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleCapLai(garage.address)}
                              disabled={isRevoking}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none"
                            >
                              <FiCheck className="w-4 h-4 mr-1.5" />
                              {isRevoking ? "Đang xử lý..." : "Cấp Lại"}
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveFromList(garage.address)
                              }
                              className="inline-flex items-center px-4 py-2 bg-white text-gray-600 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                            >
                              Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full opacity-30"></div>

        <div className="relative z-10 flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <FiShield className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-yellow-900 mb-4">
              Hướng Dẫn Quản Lý Garage
            </h3>
            <div className="text-sm font-medium text-yellow-800 space-y-2">
              {[
                "Garage được cấp quyền có thể cập nhật trạng thái giám định cho yêu cầu bồi thường",
                "Chỉ cấp quyền cho các garage uy tín và có giấy phép hoạt động hợp lệ",
                "Kiểm tra địa chỉ ví kỹ lưỡng trước khi cấp quyền — giao dịch trên blockchain không thể hoàn tác",
                "Theo dõi hoạt động giám định của garage thường xuyên",
                "Thu hồi quyền ngay khi phát hiện vi phạm hoặc gian lận",
                "Danh sách garage được lưu trữ cục bộ để tiện theo dõi",
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
    </div>
  );
};

export default GarageManagement;
