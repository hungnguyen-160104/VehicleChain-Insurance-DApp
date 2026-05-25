import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import StatsOverview from "../components/Analytics/StatsOverview";
import PolicyAnalytics from "../components/Analytics/PolicyAnalytics";
import ClaimsAnalytics from "../components/Analytics/ClaimsAnalytics";
import RevenueAnalytics from "../components/Analytics/RevenueAnalytics";
import TrendAnalytics from "../components/Analytics/TrendAnalytics";
import { contractService, CLAIM_STATUS, CLAIM_STATUS_LABELS, INSURANCE_TYPE_LABELS } from "../services/contract";
import {
  FiRefreshCw, FiTrendingUp, FiDownload, FiLock,
  FiShield, FiZap, FiActivity, FiBarChart,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function Analytics() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [analyticsData, setAnalyticsData] = useState({
    overview: {}, policies: [], claims: [], revenue: {}, trends: {},
  });

  useEffect(() => {
    if (isConnected && provider && address) loadAnalyticsData();
  }, [isConnected, provider, address, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [userPolicies, contractStats] = await Promise.all([
        contractService.getUserPolicies(address, provider),
        contractService.getContractStats(provider),
      ]);
      let allClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(policy.policyId, provider);
        allClaims = [...allClaims, ...policyClaims];
      }
      const processedData = processAnalyticsData(userPolicies, allClaims, contractStats, timeRange);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally { setLoading(false); }
  };

  const processAnalyticsData = (policies, claims, contractStats, range) => {
    const now = new Date();
    const timeRangeMs = getTimeRangeMs(range);
    const startDate = new Date(now.getTime() - timeRangeMs);
    const normalizedPolicies = policies.map((p) => ({ ...p, startDateMs: parseInt(p.startDate) * 1000 }));
    const filteredPolicies = normalizedPolicies.filter((policy) => policy.startDateMs >= startDate.getTime());
    const filteredClaims = claims.filter((claim) => claim.submissionDate >= startDate.getTime());
    return {
      overview: calculateOverviewStats(policies, claims, contractStats),
      policies: calculatePolicyAnalytics(filteredPolicies, normalizedPolicies),
      claims: calculateClaimsAnalytics(filteredClaims),
      revenue: calculateRevenueAnalytics(filteredPolicies, range),
      trends: calculateTrendAnalytics(filteredPolicies, filteredClaims, range),
    };
  };

  const getTimeRangeMs = (range) => {
    switch (range) {
      case "7d": return 7 * 24 * 60 * 60 * 1000;
      case "30d": return 30 * 24 * 60 * 60 * 1000;
      case "90d": return 90 * 24 * 60 * 60 * 1000;
      case "1y": return 365 * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  };

  const calculateOverviewStats = (policies, claims, contractStats) => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter((p) => p.status === 0).length;
    const totalClaims = claims.length;
    const approvedClaims = claims.filter((c) => c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID).length;
    const totalPremiumsPaid = policies.reduce((sum, p) => sum + parseFloat(p.totalPaid), 0);
    const totalClaimsAmount = claims.reduce((sum, c) => sum + parseFloat(c.claimAmount), 0);
    const totalApprovedAmount = claims.reduce((sum, c) => {
      if (c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID) return sum + parseFloat(c.approvedAmount);
      return sum;
    }, 0);
    return {
      totalPolicies, activePolicies, totalClaims, approvedClaims,
      totalPremiumsPaid, totalClaimsAmount, totalApprovedAmount,
      claimApprovalRate: totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0,
      lossRatio: totalPremiumsPaid > 0 ? (totalApprovedAmount / totalPremiumsPaid) * 100 : 0,
    };
  };

  const calculatePolicyAnalytics = (filteredPolicies, allPolicies) => {
    const insuranceTypeDistribution = filteredPolicies.reduce((acc, policy) => {
      const typeName = INSURANCE_TYPE_LABELS[policy.insuranceType] || "Không rõ";
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {});
    const paymentTypeDistribution = filteredPolicies.reduce((acc, policy) => {
      const paymentType = policy.paymentType === 0 ? "Trả một lần" : "Hàng tháng";
      acc[paymentType] = (acc[paymentType] || 0) + 1;
      return acc;
    }, {});
    const coverageDistribution = filteredPolicies.map((policy) => ({
      policyId: policy.policyId, coverage: parseFloat(policy.coverageAmount),
      used: parseFloat(policy.claimsUsed),
      remaining: parseFloat(policy.coverageAmount) - parseFloat(policy.claimsUsed),
    }));
    const basePolicies = allPolicies || filteredPolicies;
    return {
      insuranceTypeDistribution, paymentTypeDistribution, coverageDistribution,
      totalCoverage: basePolicies.reduce((sum, p) => sum + parseFloat(p.coverageAmount), 0),
      totalUsedCoverage: basePolicies.reduce((sum, p) => sum + parseFloat(p.claimsUsed), 0),
    };
  };

  const calculateClaimsAnalytics = (claims) => {
    const statusDistribution = claims.reduce((acc, claim) => {
      const status = CLAIM_STATUS_LABELS[claim.status] || "Không rõ";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const monthlyClaimsData = generateMonthlyData(claims, "submissionDate");
    const averageClaimAmount = claims.length > 0 ? claims.reduce((sum, c) => sum + parseFloat(c.claimAmount), 0) / claims.length : 0;
    const processedClaims = claims.filter((c) => c.processedDate && c.processedDate !== 0);
    const averageProcessingTime = processedClaims.length > 0
      ? processedClaims.reduce((sum, c) => sum + (c.processedDate - c.submissionDate), 0) / processedClaims.length / (24 * 60 * 60 * 1000)
      : 0;
    return {
      statusDistribution, monthlyClaimsData, averageClaimAmount, averageProcessingTime,
      totalClaimsValue: claims.reduce((sum, c) => sum + parseFloat(c.claimAmount), 0),
    };
  };

  const calculateRevenueAnalytics = (policies, range) => {
    const monthlyRevenueData = generateMonthlyData(policies, "startDateMs", "totalPaid");
    const revenueByInsuranceType = policies.reduce((acc, policy) => {
      const typeName = INSURANCE_TYPE_LABELS[policy.insuranceType] || "Không rõ";
      acc[typeName] = (acc[typeName] || 0) + parseFloat(policy.totalPaid);
      return acc;
    }, {});
    const totalRevenue = policies.reduce((sum, p) => sum + parseFloat(p.totalPaid), 0);
    return {
      monthlyRevenueData, revenueByInsuranceType, totalRevenue,
      averageRevenuePerPolicy: policies.length > 0 ? totalRevenue / policies.length : 0,
    };
  };

  const calculateTrendAnalytics = (policies, claims, range) => ({
    policyTrend: generateTrendData(policies, "startDateMs", range),
    claimsTrend: generateTrendData(claims, "submissionDate", range),
  });

  const generateMonthlyData = (data, dateField, valueField = null) => {
    const monthlyData = {};
    data.forEach((item) => {
      const date = new Date(parseInt(item[dateField]));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { count: 0, value: 0 };
      monthlyData[monthKey].count += 1;
      if (valueField) monthlyData[monthKey].value += parseFloat(item[valueField] || 0);
    });
    return Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b)).map(([month, data]) => ({ month, ...data }));
  };

  const generateTrendData = (data, dateField, range) => {
    const periods = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const trendData = [];
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayData = data.filter((item) => new Date(parseInt(item[dateField])).toDateString() === date.toDateString());
      trendData.push({ date: date.toISOString().split("T")[0], count: dayData.length });
    }
    return trendData;
  };

  const exportAnalytics = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          <div className="relative text-center max-w-md mx-auto">
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
                <FiBarChart className="h-16 w-16 text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md animate-pulse">
                <FiActivity className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("wallet.connect_title")}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed text-sm">{t("wallet.connect_desc")}</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiShield className="h-4 w-4 text-red-500" /><span>{t("wallet.analytics_feat_0")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiZap className="h-4 w-4 text-emerald-500" /><span>{t("wallet.analytics_feat_1")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiLock className="h-4 w-4 text-purple-500" /><span>{t("wallet.analytics_feat_2")}</span>
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("analytics.title", "Thống Kê & Phân Tích")}</h1>
            <p className="mt-2 text-gray-500 text-sm">{t("analytics.subtitle", "Dữ liệu tổng hợp từ hệ thống bảo hiểm")}</p>
          </div>
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 transition-all duration-200">
              <option value="7d">{t("analytics.last_7_days", "7 ngày qua")}</option>
              <option value="30d">{t("analytics.last_30_days", "30 ngày qua")}</option>
              <option value="90d">{t("analytics.last_90_days", "90 ngày qua")}</option>
              <option value="1y">{t("analytics.last_year", "1 năm qua")}</option>
            </select>
            <button onClick={exportAnalytics}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:shadow transition-all duration-200">
              <FiDownload className="-ml-1 mr-2 h-4 w-4" />
              {t("common.export", "Xuất dữ liệu")}
            </button>
            <button onClick={loadAnalyticsData} disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:transform-none text-sm">
              <FiRefreshCw className={`-ml-1 mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {t("common.refresh", "Làm mới")}
            </button>
          </div>
        </div>

        <StatsOverview data={analyticsData.overview} loading={loading} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <PolicyAnalytics data={analyticsData.policies} loading={loading} />
          <ClaimsAnalytics data={analyticsData.claims} loading={loading} />
        </div>

        <RevenueAnalytics data={analyticsData.revenue} loading={loading} timeRange={timeRange} />
        <TrendAnalytics data={analyticsData.trends} loading={loading} timeRange={timeRange} />
      </div>
    </Layout>
  );
}
