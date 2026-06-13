import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider } from "../provider/hooks";
import AdminLayout from "../components/Layout/AdminLayout";
import AdminStats from "../components/Admin/AdminStats";
import ClaimManagement from "../components/Admin/ClaimManagement";
import GarageManagement from "../components/Admin/GarageManagement";
import ContractControls from "../components/Admin/ContractControls";
import DocumentManagement from "../components/Admin/DocumentManagement";
import PlanManagement from "../components/Admin/PlanManagement";
import { contractService } from "../services/contract";
import Link from "next/link";
import { FiShield, FiAlertTriangle, FiLock } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function Admin() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();

  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthorizedGarage, setIsAuthorizedGarage] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [contractError, setContractError] = useState(false);
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
      if (!contract) {
        setContractError(true);
        return;
      }
      setContractError(false);
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
      const garageStatus = await contract.authorizedGarages(address);
      setIsAuthorizedGarage(garageStatus);
    } catch (error) {
      console.error("Lỗi khi kiểm tra quyền:", error);
      setIsOwner(false);
      setIsAuthorizedGarage(false);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const contractStats = await contractService.getContractStats(provider);
      const claimsResult = await contractService.fetchAllClaims(provider);
      setAdminData({
        contractStats,
        pendingClaims: claimsResult.claims || [],
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-6">
            <FiShield className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{t("wallet.connect_title")}</h3>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">{t("wallet.connect_desc")}</p>
          <Link href="/dashboard">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer text-sm">
              <FiLock className="h-4 w-4" />
              Về trang người dùng
            </span>
          </Link>
        </div>
      </div>
    );
  }

  if (contractError) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 rounded-2xl bg-yellow-900/30 border border-yellow-800/50 flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="h-12 w-12 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Contract Chưa Được Deploy</h3>
          <p className="text-gray-400 mb-4 text-sm leading-relaxed">
            Không thể kết nối với smart contract. Vui lòng kiểm tra Hardhat node đang chạy và contract đã được deploy.
          </p>
          <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 mb-8 text-left">
            <p className="text-xs text-gray-400 mb-2 font-semibold">Chạy lệnh sau để deploy:</p>
            <p className="font-mono text-xs text-yellow-300">npx hardhat run scripts/deploy.js --network localhost</p>
          </div>
          <Link href="/dashboard">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 border border-gray-600 transition-colors cursor-pointer text-sm">
              Về trang người dùng
            </span>
          </Link>
        </div>
      </div>
    );
  }

  if (!loading && !isOwner && !isAuthorizedGarage) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 rounded-2xl bg-red-900/30 border border-red-800/50 flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Không Có Quyền Truy Cập</h3>
          <p className="text-gray-400 mb-4 text-sm leading-relaxed">
            Chỉ chủ hợp đồng và garage được ủy quyền mới có thể truy cập trang quản trị.
          </p>
          <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 mb-8">
            <p className="text-xs text-gray-500 mb-1">Địa chỉ ví của bạn:</p>
            <p className="font-mono text-xs text-gray-300 break-all">{address}</p>
          </div>
          <Link href="/dashboard">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 border border-gray-600 transition-colors cursor-pointer text-sm">
              Về trang người dùng
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isOwner={isOwner}
      loading={loading}
      onRefresh={loadAdminData}
    >
      {activeTab === "overview" && (
        <AdminStats adminData={adminData} loading={loading} onRefresh={loadAdminData} />
      )}
      {activeTab === "claims" && (
        <ClaimManagement
          claims={adminData.pendingClaims}
          loading={loading}
          onRefresh={loadAdminData}
          isOwner={isOwner}
          isGarage={isAuthorizedGarage}
        />
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
    </AdminLayout>
  );
}
