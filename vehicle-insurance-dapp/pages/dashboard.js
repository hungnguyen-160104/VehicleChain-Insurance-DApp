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

      // Load user policies
      const userPolicies = await contractService.getUserPolicies(
        address,
        provider
      );

      // Load user claims from all policies
      let userClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(
          policy.policyId,
          provider
        );
        userClaims = [...userClaims, ...policyClaims];
      }

      // Load contract stats
      const contractStats = await contractService.getContractStats(provider);

      // Load user vehicles
      const userVehicles = await contractService.getUserVehicles(
        address,
        provider
      );

      setDashboardData({
        userPolicies,
        userClaims,
        contractStats,
        userVehicles,
      });
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
              <div className="w-28 h-28 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{ background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.25)", backdropFilter: "blur(12px)" }}
              >
                <FiLock className="h-14 w-14 text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiWifi className="h-4 w-4 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 opacity-15 blur-xl animate-pulse"></div>
            </div>

            {/* Glass card content */}
            <div className="rounded-2xl p-8 shadow-2xl"
              style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <h3 className="text-2xl font-bold text-white mb-3">{t("wallet.connect_title")}</h3>
              <p className="text-white/60 mb-8 leading-relaxed text-sm">{t("wallet.connect_desc")}</p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-white/70">
                  <FiTruck className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <span>{t("wallet.dashboard_feat_0")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-white/70">
                  <FiZap className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>{t("wallet.dashboard_feat_1")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-white/70">
                  <FiLock className="h-4 w-4 text-purple-400 flex-shrink-0" />
                  <span>{t("wallet.dashboard_feat_2")}</span>
                </div>
              </div>

              <button className="group relative inline-flex items-center justify-center w-full px-8 py-4 bg-gradient-to-r from-red-700 to-red-900 text-white font-semibold rounded-xl shadow-lg shadow-red-900/40 hover:shadow-xl hover:from-red-600 hover:to-red-800 transition-all duration-300 transform hover:scale-105">
                <FiLock className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
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
          <h1 className="text-3xl font-bold text-white">{t("dashboard.title", "Tổng quan")}</h1>
          <p className="mt-2 text-white/60">
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
          {/* Policy Overview */}
          <PolicyOverview
            policies={dashboardData.userPolicies}
            userVehicles={dashboardData.userVehicles}
            loading={loading}
            onRefresh={loadDashboardData}
          />

          {/* Claims Overview */}
          <ClaimsOverview
            claims={dashboardData.userClaims}
            userVehicles={dashboardData.userVehicles}
            loading={loading}
            onRefresh={loadDashboardData}
          />
        </div>

        {/* Recent Activity */}
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
