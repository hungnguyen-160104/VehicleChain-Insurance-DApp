import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  FiWifi,
  FiShield,
  FiZap,
  FiLock,
  FiRefreshCw,
  FiTrendingUp,
  FiActivity,
  FiTruck,
} from "react-icons/fi";

import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import StatsCards from "../components/Dashboard/StatsCards";
import RecentActivity from "../components/Dashboard/RecentActivity";
import QuickActions from "../components/Dashboard/QuickActions";
import PolicyOverview from "../components/Dashboard/PolicyOverview";
import ClaimsOverview from "../components/Dashboard/ClaimsOverview";
import { contractService } from "../services/contract";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    userPolicies: [],
    userClaims: [],
    contractStats: {
      totalPolicies: "0",
      totalClaims: "0",
      contractBalance: "0",
    },
    userVehicles: [],
  });

  useEffect(() => {
    if (isConnected && provider && address) {
      loadDashboardData();
    }
  }, [isConnected, provider, address]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userPolicies = await contractService.getUserPolicies(address, provider);
      let userClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(policy.policyId, provider);
        userClaims = [...userClaims, ...policyClaims];
      }
      const contractStats = await contractService.getContractStats(provider);
      const userVehicles = await contractService.getUserVehicles(address, provider);
      setDashboardData({ userPolicies, userClaims, contractStats, userVehicles });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          <div className="relative text-center max-w-md mx-auto">
            {/* Wallet Icon */}
            <div className="relative mx-auto mb-8 w-28 h-28">
              <div className="w-28 h-28 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
                <FiLock className="h-14 w-14 text-red-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md animate-pulse">
                <FiWifi className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Card content */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("wallet.connect_title")}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed text-sm">{t("wallet.connect_desc")}</p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiTruck className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span>{t("wallet.dashboard_feat_0")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiZap className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>{t("wallet.dashboard_feat_1")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiLock className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span>{t("wallet.dashboard_feat_2")}</span>
                </div>
              </div>

              <button className="group inline-flex items-center justify-center w-full px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200">
                <FiLock className="mr-2 h-5 w-5" />
                <span>{t("wallet.connect_btn")}</span>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("dashboard.title", "Tổng quan")}</h1>
          <p className="mt-2 text-gray-500 text-sm">
            {t("dashboard.subtitle", "Quản lý bảo hiểm xe của bạn")}
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards
          userPolicies={dashboardData.userPolicies}
          userClaims={dashboardData.userClaims}
          contractStats={dashboardData.contractStats}
          userVehicles={dashboardData.userVehicles}
          loading={loading}
        />

        {/* Quick Actions */}
        <QuickActions userVehicles={dashboardData.userVehicles} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PolicyOverview
            policies={dashboardData.userPolicies}
            userVehicles={dashboardData.userVehicles}
            loading={loading}
            onRefresh={loadDashboardData}
          />
          <ClaimsOverview
            claims={dashboardData.userClaims}
            userVehicles={dashboardData.userVehicles}
            loading={loading}
            onRefresh={loadDashboardData}
          />
        </div>

        <RecentActivity
          policies={dashboardData.userPolicies}
          claims={dashboardData.userClaims}
          userVehicles={dashboardData.userVehicles}
          loading={loading}
        />
      </div>
    </Layout>
  );
}
