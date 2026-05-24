import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import AdminStats from "../components/Admin/AdminStats";
import ClaimManagement from "../components/Admin/ClaimManagement";
import GarageManagement from "../components/Admin/GarageManagement";
import ContractControls from "../components/Admin/ContractControls";
import DocumentManagement from "../components/Admin/DocumentManagement";
import PlanManagement from "../components/Admin/PlanManagement";
import { contractService } from "../services/contract";
import {
  FiShield,
  FiSettings,
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiLock,
  FiZap,
  FiRefreshCw,
  FiTruck,
  FiCpu,
  FiList,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function Admin() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthorizedGarage, setIsAuthorizedGarage] = useState(false);
  const [activeTab, setActiveTab] = useState("claims");
  const [adminData, setAdminData] = useState({
    contractStats: {},
    pendingClaims: [],
    authorizedGarages: [],
    contractBalance: "0",
    totalPolicies: "0",
    totalClaims: "0",
  });

  useEffect(() => {
    if (isConnected && provider && address) {
      checkAccessStatus();
    }
  }, [isConnected, provider, address]);

  useEffect(() => {
    if ((isOwner || isAuthorizedGarage) && provider) {
      loadAdminData();
    }
  }, [isOwner, isAuthorizedGarage, provider]);

  const checkAccessStatus = async () => {
    try {
      setLoading(true);
      const contract = contractService.initContract(provider);
      if (contract) {
        // Kiểm tra chủ hợp đồng
        const owner = await contract.owner();
        const ownerStatus = owner.toLowerCase() === address.toLowerCase();
        setIsOwner(ownerStatus);

        // Kiểm tra garage được ủy quyền
        const garageStatus = await contract.authorizedGarages(address);
        setIsAuthorizedGarage(garageStatus);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra quyền truy cập:", error);
      setIsOwner(false);
      setIsAuthorizedGarage(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Tải thống kê hợp đồng
      const contractStats = await contractService.getContractStats(provider);

      // Tải tất cả yêu cầu bồi thường
      const allClaims = await contractService.fetchAllClaims(provider);

      setAdminData({
        contractStats,
        pendingClaims: allClaims,
        authorizedGarages: [],
        contractBalance: contractStats.contractBalance || "0",
        totalPolicies: contractStats.totalPolicies || "0",
        totalClaims: contractStats.totalClaims || "0",
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu quản trị:", error);
    } finally {
      setLoading(false);
    }
  };

  // Các tab hiển thị dựa theo quyền
  const tabs = [
    {
      id: "claims",
      name: t("admin.tab_claims", "Yêu Cầu BT"),
      icon: FiFileText,
      color: "orange",
      visibleTo: "all", // cả owner và garage
    },
    {
      id: "garages",
      name: t("admin.tab_garage", "Quản Lý Garage"),
      icon: FiUsers,
      color: "emerald",
      visibleTo: "owner", // chỉ owner
    },
    {
      id: "controls",
      name: t("admin.tab_settings", "Cài Đặt"),
      icon: FiSettings,
      color: "red",
      visibleTo: "owner", // chỉ owner
    },
    {
      id: "plans",
      name: "Gói Bảo Hiểm",
      icon: FiList,
      color: "blue",
      visibleTo: "owner",
    },
    {
      id: "ai-documents",
      name: "Tài Liệu AI",
      icon: FiCpu,
      color: "purple",
      visibleTo: "owner", // chỉ owner
    },
  ].filter((tab) => {
    if (tab.visibleTo === "all") return true;
    if (tab.visibleTo === "owner") return isOwner;
    return false;
  });

  const colorSchemes = {
    blue: {
      active: "bg-gradient-to-r from-red-600 to-orange-500 text-white",
      inactive: "text-white/60 hover:text-red-400",
    },
    teal: {
      active: "bg-gradient-to-r from-teal-500 to-cyan-500 text-white",
      inactive: "text-white/60 hover:text-teal-400",
    },
    purple: {
      active: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      inactive: "text-white/60 hover:text-purple-400",
    },
    emerald: {
      active: "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
      inactive: "text-white/60 hover:text-emerald-400",
    },
    orange: {
      active: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
      inactive: "text-white/60 hover:text-orange-400",
    },
    red: {
      active: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      inactive: "text-white/60 hover:text-red-400",
    },
  };

  // Trạng thái: chưa kết nối ví
  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          {/* Nền trang trí */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "4s" }}
            ></div>
          </div>

          <div className="relative text-center max-w-md mx-auto">
            {/* Icon chính */}
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-900/40 to-orange-900/30 flex items-center justify-center shadow-2xl border border-white/12 backdrop-blur-sm">
                <FiShield className="h-16 w-16 text-red-400" />
              </div>

              {/* Chỉ báo nổi */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiSettings className="h-4 w-4 text-white" />
              </div>

              {/* Hiệu ứng phát sáng */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 opacity-20 blur-xl animate-pulse"></div>
            </div>

            {/* Nội dung */}
            <div className="bg-white/8 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/12">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t("wallet.connect_title")}
              </h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                {t("wallet.connect_desc")}
              </p>

              {/* Danh sách tính năng */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-white/80">
                  <FiShield className="h-4 w-4 text-red-400" />
                  <span>{t("wallet.admin_feat_0")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-white/80">
                  <FiZap className="h-4 w-4 text-emerald-400" />
                  <span>{t("wallet.admin_feat_1")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-white/80">
                  <FiLock className="h-4 w-4 text-purple-400" />
                  <span>{t("wallet.admin_feat_2")}</span>
                </div>
              </div>

              {/* Nút kết nối */}
              <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-700 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <FiLock className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>{t("wallet.connect_btn")}</span>
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Trạng thái: không có quyền truy cập
  if (!loading && !isOwner && !isAuthorizedGarage) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          {/* Nền trang trí */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          <div className="relative text-center max-w-md mx-auto">
            {/* Icon chính */}
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-900/40 to-pink-900/30 flex items-center justify-center shadow-2xl border border-white/12 backdrop-blur-sm">
                <FiAlertTriangle className="h-16 w-16 text-red-400" />
              </div>

              {/* Hiệu ứng phát sáng */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 opacity-20 blur-xl animate-pulse"></div>
            </div>

            {/* Nội dung */}
            <div className="bg-white/8 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/12">
              <h3 className="text-2xl font-bold text-white mb-4">
                Không Có Quyền Truy Cập
              </h3>
              <p className="text-white/60 mb-6 leading-relaxed">
                Chỉ chủ hợp đồng và garage được ủy quyền mới có thể truy cập
                trang quản trị này.
              </p>
              <div className="bg-white/5 rounded-xl p-4 border border-white/12">
                <div className="text-sm font-medium text-white/50 mb-1">
                  Địa chỉ ví của bạn:
                </div>
                <div className="font-mono text-sm text-white break-all">
                  {address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {t("admin.title", "Quản Trị Hệ Thống")}
            </h1>
            <p className="mt-2 text-white/60">
              {t("admin.subtitle", "Quản lý và xử lý yêu cầu bồi thường")}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Badge vai trò */}
            {isOwner && (
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 text-red-400 rounded-xl border border-red-200 shadow-sm">
                <FiShield className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold">Chủ Hợp Đồng</span>
              </div>
            )}
            {isAuthorizedGarage && !isOwner && (
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-900/20 to-green-900/15 text-emerald-400 rounded-xl border border-emerald-500/25 shadow-sm">
                <FiTruck className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold">Garage Ủy Quyền</span>
              </div>
            )}

            {/* Nút làm mới */}
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="group inline-flex items-center px-4 py-2 bg-white/8 backdrop-blur-xl border border-white/12 shadow-lg text-sm font-medium rounded-xl text-white/80 hover:bg-white/8 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 disabled:opacity-50 transition-all duration-300"
            >
              <FiRefreshCw
                className={`-ml-1 mr-2 h-4 w-4 ${
                  loading ? "animate-spin" : ""
                } group-hover:scale-110 transition-transform`}
              />
              Làm mới
            </button>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        <AdminStats
          data={adminData}
          loading={loading}
          onRefresh={loadAdminData}
        />

        {/* Thanh điều hướng tab */}
        <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl overflow-hidden">
          {/* Nền trang trí */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl"></div>
          </div>

          <div className="relative">
            <nav className="flex space-x-1 p-2 flex-wrap gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const scheme = colorSchemes[tab.color];

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative inline-flex items-center px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      activeTab === tab.id
                        ? `${scheme.active} shadow-lg`
                        : `${scheme.inactive} hover:bg-white/5`
                    }`}
                  >
                    <Icon
                      className={`mr-2 h-5 w-5 group-hover:scale-110 transition-transform ${
                        activeTab === tab.id ? "text-white" : ""
                      }`}
                    />
                    {tab.name}
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Nội dung tab */}
        <div className="mt-8">
          {/* Tab: Yêu Cầu Bồi Thường — hiển thị cho owner và garage */}
          {activeTab === "claims" && (
            <ClaimManagement
              claims={adminData.pendingClaims}
              loading={loading}
              onRefresh={loadAdminData}
            />
          )}

          {/* Tab: Quản Lý Garage — chỉ owner */}
          {activeTab === "garages" && isOwner && (
            <GarageManagement loading={loading} onRefresh={loadAdminData} />
          )}

          {/* Tab: Cài Đặt Contract — chỉ owner */}
          {activeTab === "controls" && isOwner && (
            <ContractControls
              contractBalance={adminData.contractBalance}
              loading={loading}
              onRefresh={loadAdminData}
            />
          )}

          {/* Tab: Gói Bảo Hiểm — chỉ owner */}
          {activeTab === "plans" && isOwner && (
            <PlanManagement />
          )}

          {/* Tab: Tài Liệu AI — chỉ owner */}
          {activeTab === "ai-documents" && isOwner && (
            <div
              className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-6 overflow-hidden"
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <DocumentManagement />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}





