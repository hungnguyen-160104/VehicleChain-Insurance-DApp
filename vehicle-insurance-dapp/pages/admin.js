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
  FiShield, FiSettings, FiUsers, FiFileText, FiAlertTriangle,
  FiLock, FiZap, FiRefreshCw, FiTruck, FiCpu, FiList,
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
    if (isConnected && provider && address) checkAccessStatus();
  }, [isConnected, provider, address]);

  useEffect(() => {
    if ((isOwner || isAuthorizedGarage) && provider) loadAdminData();
  }, [isOwner, isAuthorizedGarage, provider]);

  const checkAccessStatus = async () => {
    try {
      setLoading(true);
      const contract = contractService.initContract(provider);
      if (contract) {
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === address.toLowerCase());
        const garageStatus = await contract.authorizedGarages(address);
        setIsAuthorizedGarage(garageStatus);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra quyền:", error);
      setIsOwner(false);
      setIsAuthorizedGarage(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const contractStats = await contractService.getContractStats(provider);
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
      console.error("Lỗi khi tải dữ liệu admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "claims", name: t("admin.tab_claims", "Yêu Cầu BT"), icon: FiFileText, color: "orange", visibleTo: "all" },
    { id: "garages", name: t("admin.tab_garage", "Quản Lý Garage"), icon: FiUsers, color: "emerald", visibleTo: "owner" },
    { id: "controls", name: t("admin.tab_settings", "Cài Đặt"), icon: FiSettings, color: "red", visibleTo: "owner" },
    { id: "plans", name: "Gói Bảo Hiểm", icon: FiList, color: "blue", visibleTo: "owner" },
    { id: "ai-documents", name: "Tài Liệu AI", icon: FiCpu, color: "purple", visibleTo: "owner" },
  ].filter((tab) => {
    if (tab.visibleTo === "all") return true;
    if (tab.visibleTo === "owner") return isOwner;
    return false;
  });

  const colorSchemes = {
    blue: {
      active: "bg-red-600 text-white",
      inactive: "text-gray-600 hover:text-red-600 hover:bg-red-50",
    },
    teal: {
      active: "bg-teal-600 text-white",
      inactive: "text-gray-600 hover:text-teal-600 hover:bg-teal-50",
    },
    purple: {
      active: "bg-purple-600 text-white",
      inactive: "text-gray-600 hover:text-purple-600 hover:bg-purple-50",
    },
    emerald: {
      active: "bg-emerald-600 text-white",
      inactive: "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50",
    },
    orange: {
      active: "bg-orange-500 text-white",
      inactive: "text-gray-600 hover:text-orange-600 hover:bg-orange-50",
    },
    red: {
      active: "bg-red-600 text-white",
      inactive: "text-gray-600 hover:text-red-600 hover:bg-red-50",
    },
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          <div className="relative text-center max-w-md mx-auto">
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
                <FiShield className="h-16 w-16 text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md animate-pulse">
                <FiSettings className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("wallet.connect_title")}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed text-sm">{t("wallet.connect_desc")}</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiShield className="h-4 w-4 text-red-500" /><span>{t("wallet.admin_feat_0")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiZap className="h-4 w-4 text-emerald-500" /><span>{t("wallet.admin_feat_1")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiLock className="h-4 w-4 text-purple-500" /><span>{t("wallet.admin_feat_2")}</span>
                </div>
              </div>
              <button className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 w-full">
                <FiLock className="mr-2 h-5 w-5" /><span>{t("wallet.connect_btn")}</span>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!loading && !isOwner && !isAuthorizedGarage) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          <div className="relative text-center max-w-md mx-auto">
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
                <FiAlertTriangle className="h-16 w-16 text-red-400" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Không Có Quyền Truy Cập</h3>
              <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                Chỉ chủ hợp đồng và garage được ủy quyền mới có thể truy cập trang quản trị này.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-medium text-gray-400 mb-1">Địa chỉ ví của bạn:</div>
                <div className="font-mono text-xs text-gray-700 break-all">{address}</div>
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
            <h1 className="text-3xl font-bold text-gray-900">{t("admin.title", "Quản Trị Hệ Thống")}</h1>
            <p className="mt-2 text-gray-500 text-sm">{t("admin.subtitle", "Quản lý và xử lý yêu cầu bồi thường")}</p>
          </div>
          <div className="flex items-center space-x-3">
            {isOwner && (
              <div className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 shadow-sm">
                <FiShield className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold">Chủ Hợp Đồng</span>
              </div>
            )}
            {isAuthorizedGarage && !isOwner && (
              <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 shadow-sm">
                <FiTruck className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold">Garage Ủy Quyền</span>
              </div>
            )}
            <button onClick={loadAdminData} disabled={loading}
              className="group inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none disabled:opacity-50 transition-all duration-200">
              <FiRefreshCw className={`-ml-1 mr-2 h-4 w-4 ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Stats */}
        <AdminStats data={adminData} loading={loading} onRefresh={loadAdminData} />

        {/* Tab navigation */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <nav className="flex space-x-1 p-2 flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const scheme = colorSchemes[tab.color];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-150 ${
                    activeTab === tab.id
                      ? `${scheme.active} shadow-sm`
                      : `${scheme.inactive}`
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "claims" && (
            <ClaimManagement claims={adminData.pendingClaims} loading={loading} onRefresh={loadAdminData} />
          )}
          {activeTab === "garages" && isOwner && (
            <GarageManagement loading={loading} onRefresh={loadAdminData} />
          )}
          {activeTab === "controls" && isOwner && (
            <ContractControls contractBalance={adminData.contractBalance} loading={loading} onRefresh={loadAdminData} />
          )}
          {activeTab === "plans" && isOwner && (
            <PlanManagement />
          )}
          {activeTab === "ai-documents" && isOwner && (
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              <DocumentManagement />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
