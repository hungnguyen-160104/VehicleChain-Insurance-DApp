import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import StatsOverview from "../components/Analytics/StatsOverview";
import PolicyAnalytics from "../components/Analytics/PolicyAnalytics";
import ClaimsAnalytics from "../components/Analytics/ClaimsAnalytics";
import RevenueAnalytics from "../components/Analytics/RevenueAnalytics";
import TrendAnalytics from "../components/Analytics/TrendAnalytics";
import {
  contractService,
  CLAIM_STATUS,
  CLAIM_STATUS_LABELS,
  INSURANCE_TYPE_LABELS,
} from "../services/contract";
import {
  FiRefreshCw,
  FiTrendingUp,
  FiDownload,
  FiLock,
  FiShield,
  FiZap,
  FiActivity,
  FiBarChart,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function Analytics() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d, 1y
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    policies: [],
    claims: [],
    revenue: {},
    trends: {},
  });

  useEffect(() => {
    if (isConnected && provider && address) {
      loadAnalyticsData();
    }
  }, [isConnected, provider, address, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Load user's policies and claims data
      const [userPolicies, contractStats] = await Promise.all([
        contractService.getUserPolicies(address, provider),
        contractService.getContractStats(provider),
      ]);

      // Load claims for all user policies
      let allClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(
          policy.policyId,
          provider
        );
        allClaims = [...allClaims, ...policyClaims];
      }

      // Process and analyze the data
      const processedData = processAnalyticsData(
        userPolicies,
        allClaims,
        contractStats,
        timeRange
      );

      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (policies, claims, contractStats, range) => {
    const now = new Date();
    const timeRangeMs = getTimeRangeMs(range);
    const startDate = new Date(now.getTime() - timeRangeMs);

    // Normalize all dates to ms: policy.startDate is in seconds, claim dates already in ms
    const normalizedPolicies = policies.map((p) => ({
      ...p,
      startDateMs: parseInt(p.startDate) * 1000,
    }));

    // Filter data by time range
    const filteredPolicies = normalizedPolicies.filter((policy) => {
      return policy.startDateMs >= startDate.getTime();
    });

    const filteredClaims = claims.filter((claim) => {
      return claim.submissionDate >= startDate.getTime();
    });

    // Calculate overview stats
    const overview = calculateOverviewStats(policies, claims, contractStats);

    // Calculate policy analytics — pass full list for coverage, filtered for distribution
    const policyAnalytics = calculatePolicyAnalytics(filteredPolicies, normalizedPolicies);

    // Calculate claims analytics
    const claimsAnalytics = calculateClaimsAnalytics(filteredClaims);

    // Calculate revenue analytics
    const revenueAnalytics = calculateRevenueAnalytics(filteredPolicies, range);

    // Calculate trend analytics — use normalized policy dates
    const trendAnalytics = calculateTrendAnalytics(
      filteredPolicies,
      filteredClaims,
      range
    );

    return {
      overview,
      policies: policyAnalytics,
      claims: claimsAnalytics,
      revenue: revenueAnalytics,
      trends: trendAnalytics,
    };
  };

  const getTimeRangeMs = (range) => {
    switch (range) {
      case "7d":
        return 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return 30 * 24 * 60 * 60 * 1000;
      case "90d":
        return 90 * 24 * 60 * 60 * 1000;
      case "1y":
        return 365 * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  };

  const calculateOverviewStats = (policies, claims, contractStats) => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter((p) => p.status === 0).length;
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(
      (c) => c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID
    ).length;
    const totalPremiumsPaid = policies.reduce(
      (sum, p) => sum + parseFloat(p.totalPaid),
      0
    );
    const totalClaimsAmount = claims.reduce(
      (sum, c) => sum + parseFloat(c.claimAmount),
      0
    );
    const totalApprovedAmount = claims.reduce((sum, c) => {
      if (c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID) {
        return sum + parseFloat(c.approvedAmount);
      }
      return sum;
    }, 0);

    return {
      totalPolicies,
      activePolicies,
      totalClaims,
      approvedClaims,
      totalPremiumsPaid,
      totalClaimsAmount,
      totalApprovedAmount,
      claimApprovalRate:
        totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0,
      lossRatio:
        totalPremiumsPaid > 0
          ? (totalApprovedAmount / totalPremiumsPaid) * 100
          : 0,
    };
  };

  const calculatePolicyAnalytics = (filteredPolicies, allPolicies) => {
    const insuranceTypeDistribution = filteredPolicies.reduce((acc, policy) => {
      const typeName =
        INSURANCE_TYPE_LABELS[policy.insuranceType] || "Không rõ";
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {});

    const paymentTypeDistribution = filteredPolicies.reduce((acc, policy) => {
      const paymentType = policy.paymentType === 0 ? "Trả một lần" : "Hàng tháng";
      acc[paymentType] = (acc[paymentType] || 0) + 1;
      return acc;
    }, {});

    const coverageDistribution = filteredPolicies.map((policy) => ({
      policyId: policy.policyId,
      coverage: parseFloat(policy.coverageAmount),
      used: parseFloat(policy.claimsUsed),
      remaining:
        parseFloat(policy.coverageAmount) - parseFloat(policy.claimsUsed),
    }));

    const basePolicies = allPolicies || filteredPolicies;
    return {
      insuranceTypeDistribution,
      paymentTypeDistribution,
      coverageDistribution,
      totalCoverage: basePolicies.reduce(
        (sum, p) => sum + parseFloat(p.coverageAmount),
        0
      ),
      totalUsedCoverage: basePolicies.reduce(
        (sum, p) => sum + parseFloat(p.claimsUsed),
        0
      ),
    };
  };

  const calculateClaimsAnalytics = (claims) => {
    const statusDistribution = claims.reduce((acc, claim) => {
      const status = CLAIM_STATUS_LABELS[claim.status] || "Không rõ";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // submissionDate from getClaim is already in ms
    const monthlyClaimsData = generateMonthlyData(claims, "submissionDate");

    const averageClaimAmount =
      claims.length > 0
        ? claims.reduce((sum, c) => sum + parseFloat(c.claimAmount), 0) /
          claims.length
        : 0;

    const processedClaims = claims.filter(
      (c) => c.processedDate && c.processedDate !== 0
    );
    const averageProcessingTime =
      processedClaims.length > 0
        ? processedClaims.reduce((sum, c) => {
            const processingTime = c.processedDate - c.submissionDate; // ms - ms
            return sum + processingTime;
          }, 0) /
          processedClaims.length /
          (24 * 60 * 60 * 1000) // convert ms to days
        : 0;

    return {
      statusDistribution,
      monthlyClaimsData,
      averageClaimAmount,
      averageProcessingTime,
      totalClaimsValue: claims.reduce(
        (sum, c) => sum + parseFloat(c.claimAmount),
        0
      ),
    };
  };

  const calculateRevenueAnalytics = (policies, range) => {
    // policies here have startDateMs (ms); use that field for monthly grouping
    const monthlyRevenueData = generateMonthlyData(
      policies,
      "startDateMs",
      "totalPaid"
    );

    const revenueByInsuranceType = policies.reduce((acc, policy) => {
      const typeName =
        INSURANCE_TYPE_LABELS[policy.insuranceType] || "Không rõ";
      acc[typeName] = (acc[typeName] || 0) + parseFloat(policy.totalPaid);
      return acc;
    }, {});

    const totalRevenue = policies.reduce(
      (sum, p) => sum + parseFloat(p.totalPaid),
      0
    );
    const averageRevenuePerPolicy =
      policies.length > 0 ? totalRevenue / policies.length : 0;

    return {
      monthlyRevenueData,
      revenueByInsuranceType,
      totalRevenue,
      averageRevenuePerPolicy,
    };
  };

  const calculateTrendAnalytics = (policies, claims, range) => {
    // policies have startDateMs (ms); claims have submissionDate (ms)
    const policyTrend = generateTrendData(policies, "startDateMs", range);
    const claimsTrend = generateTrendData(claims, "submissionDate", range);

    return {
      policyTrend,
      claimsTrend,
    };
  };

  const generateMonthlyData = (data, dateField, valueField = null) => {
    const monthlyData = {};

    data.forEach((item) => {
      // All dateFields passed here are already in ms
      const date = new Date(parseInt(item[dateField]));
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, value: 0 };
      }

      monthlyData[monthKey].count += 1;
      if (valueField) {
        monthlyData[monthKey].value += parseFloat(item[valueField] || 0);
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        ...data,
      }));
  };

  const generateTrendData = (data, dateField, range) => {
    const periods =
      range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const trendData = [];

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayData = data.filter((item) => {
        // All dateFields passed here are already in ms
        const itemDate = new Date(parseInt(item[dateField]));
        return itemDate.toDateString() === date.toDateString();
      });

      trendData.push({
        date: date.toISOString().split("T")[0],
        count: dayData.length,
      });
    }

    return trendData;
  };

  const exportAnalytics = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `analytics-${timeRange}-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          {/* Background Elements */}
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
            {/* Enhanced Icon */}
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-900/40 to-orange-900/30 flex items-center justify-center shadow-2xl border border-white/12 backdrop-blur-sm">
                <FiBarChart className="h-16 w-16 text-red-400" />
              </div>

              {/* Floating indicators */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiActivity className="h-4 w-4 text-white" />
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 opacity-20 blur-xl animate-pulse"></div>
            </div>

            {/* Enhanced Content */}
            <div className="bg-white/8 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/12">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t("wallet.connect_title")}
              </h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                {t("wallet.connect_desc")}
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-white/80">
                  <FiShield className="h-4 w-4 text-red-400" />
                  <span>{t("wallet.analytics_feat_0")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-white/80">
                  <FiZap className="h-4 w-4 text-emerald-400" />
                  <span>{t("wallet.analytics_feat_1")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-white/80">
                  <FiLock className="h-4 w-4 text-purple-400" />
                  <span>{t("wallet.analytics_feat_2")}</span>
                </div>
              </div>

              {/* Connect button */}
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {t("analytics.title", "Thống Kê & Phân Tích")}
            </h1>
            <p className="mt-2 text-white/60">
              {t("analytics.subtitle", "Dữ liệu tổng hợp từ hệ thống bảo hiểm")}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white/8 backdrop-blur-xl border border-white/12 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300"
            >
              <option value="7d">{t("analytics.last_7_days", "7 ngày qua")}</option>
              <option value="30d">{t("analytics.last_30_days", "30 ngày qua")}</option>
              <option value="90d">{t("analytics.last_90_days", "90 ngày qua")}</option>
              <option value="1y">{t("analytics.last_year", "1 năm qua")}</option>
            </select>

            {/* Action Buttons */}
            <button
              onClick={exportAnalytics}
              className="group inline-flex items-center px-4 py-2 bg-white/8 backdrop-blur-xl border border-white/12 shadow-lg text-sm font-medium rounded-xl text-white/80 hover:bg-white/8 hover:shadow-xl transition-all duration-300"
            >
              <FiDownload className="-ml-1 mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              {t("common.export", "Xuất dữ liệu")}
            </button>

            <button
              onClick={loadAnalyticsData}
              disabled={loading}
              className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-700 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              <FiRefreshCw
                className={`-ml-1 mr-2 h-4 w-4 ${
                  loading ? "animate-spin" : "group-hover:scale-110"
                } transition-transform`}
              />
              {t("common.refresh", "Làm mới")}
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview data={analyticsData.overview} loading={loading} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Policy Analytics */}
          <PolicyAnalytics data={analyticsData.policies} loading={loading} />

          {/* Claims Analytics */}
          <ClaimsAnalytics data={analyticsData.claims} loading={loading} />
        </div>

        {/* Revenue Analytics */}
        <RevenueAnalytics
          data={analyticsData.revenue}
          loading={loading}
          timeRange={timeRange}
        />

        {/* Trend Analytics */}
        <TrendAnalytics
          data={analyticsData.trends}
          loading={loading}
          timeRange={timeRange}
        />
      </div>
    </Layout>
  );
}




