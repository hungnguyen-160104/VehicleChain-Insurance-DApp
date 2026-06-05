import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import ClaimCard from "../components/Claims/ClaimCard";
import SubmitClaimModal from "../components/Claims/SubmitClaimModal";
import ProcessClaimModal from "../components/Claims/ProcessClaimModal";
import { contractService, CLAIM_STATUS } from "../services/contract";
import {
  FiRefreshCw, FiFileText, FiPlus, FiFilter,
  FiLock, FiShield, FiZap, FiActivity, FiTrendingUp, FiTruck,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function Claims() {
  const { t } = useTranslation();
  const router = useRouter();
  const { policyId } = router.query;
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitClaimModalOpen, setSubmitClaimModalOpen] = useState(false);
  const [processClaimModalOpen, setProcessClaimModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    if (isConnected && provider && address) loadData();
  }, [isConnected, provider, address]);

  useEffect(() => {
    if (policyId && policies.length > 0) setSelectedPolicy(policyId);
  }, [policyId, policies]);

  useEffect(() => { applyFilters(); }, [claims, selectedPolicy, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userPolicies = await contractService.getUserPolicies(address, provider);
      setPolicies(userPolicies);
      let allClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(policy.policyId, provider);
        const enrichedClaims = policyClaims.map((claim) => ({
          ...claim,
          vehicleBienSo: claim.vehicleBienSo || policy.vehicleBienSo || "",
        }));
        allClaims = [...allClaims, ...enrichedClaims];
      }
      setClaims(allClaims);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally { setLoading(false); }
  };

  const applyFilters = () => {
    let filtered = [...claims];
    if (selectedPolicy) {
      filtered = filtered.filter((claim) => claim.policyId.toString() === selectedPolicy.toString());
    }
    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        filtered = filtered.filter((claim) => [CLAIM_STATUS.PENDING, CLAIM_STATUS.DANG_GIAM_DINH, CLAIM_STATUS.CHO_HO_SO, CLAIM_STATUS.DANG_THAM_DINH].includes(Number(claim.status)));
      } else if (statusFilter === "approved") {
        filtered = filtered.filter((claim) => Number(claim.status) === CLAIM_STATUS.APPROVED);
      } else if (statusFilter === "rejected") {
        filtered = filtered.filter((claim) => Number(claim.status) === CLAIM_STATUS.REJECTED);
      } else if (statusFilter === "paid") {
        filtered = filtered.filter((claim) => Number(claim.status) === CLAIM_STATUS.PAID);
      }
    }
    filtered.sort((a, b) => parseInt(b.submissionDate) - parseInt(a.submissionDate));
    setFilteredClaims(filtered);
  };

  const handleProcessClaim = (claim) => { setSelectedClaim(claim); setProcessClaimModalOpen(true); };

  const getClaimStats = () => {
    const pendingStatuses = [CLAIM_STATUS.PENDING, CLAIM_STATUS.DANG_GIAM_DINH, CLAIM_STATUS.CHO_HO_SO, CLAIM_STATUS.DANG_THAM_DINH];
    return {
      total: claims.length,
      pending: claims.filter((c) => pendingStatuses.includes(Number(c.status))).length,
      approved: claims.filter((c) => Number(c.status) === CLAIM_STATUS.APPROVED || Number(c.status) === CLAIM_STATUS.PAID).length,
      totalBoiThuong: claims.reduce((sum, claim) => Number(claim.status) === CLAIM_STATUS.PAID ? sum + parseFloat(claim.approvedAmount || 0) : sum, 0),
    };
  };
  const stats = getClaimStats();

  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          <div className="relative text-center max-w-md mx-auto">
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
                <FiTruck className="h-16 w-16 text-red-400" />
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
                  <FiShield className="h-4 w-4 text-red-500" /><span>{t("wallet.claims_feat_0")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiZap className="h-4 w-4 text-emerald-500" /><span>{t("wallet.claims_feat_1")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FiLock className="h-4 w-4 text-purple-500" /><span>{t("wallet.claims_feat_2")}</span>
                </div>
              </div>
              <button
                onClick={openConnectModal}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 w-full"
              >
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("claims.title", "Yêu Cầu Bồi Thường")}</h1>
            <p className="mt-2 text-gray-500 text-sm">{t("claims.subtitle", "Quản lý yêu cầu bồi thường của bạn")}</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={loadData} disabled={loading}
              className="group inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-100 hover:shadow focus:outline-none disabled:opacity-50 transition-all duration-200">
              <FiRefreshCw className={`-ml-1 mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
            <button onClick={() => setSubmitClaimModalOpen(true)}
              className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm">
              <FiPlus className="-ml-1 mr-2 h-4 w-4" />
              {t("claims.submit_claim", "Nộp yêu cầu")}
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Tổng Yêu Cầu", value: stats.total, icon: FiFileText, iconColor: "text-red-500", bg: "bg-red-50" },
            { label: "Chờ Xử Lý", value: stats.pending, icon: null, iconColor: null, bg: "bg-yellow-50", isPulse: true, pulseColor: "bg-yellow-400" },
            { label: "Đã Duyệt", value: stats.approved, icon: null, iconColor: null, bg: "bg-emerald-50", isPulse: true, pulseColor: "bg-emerald-500" },
            { label: "Tổng Bồi Thường", value: `${stats.totalBoiThuong.toFixed(4)} ETH`, icon: FiTrendingUp, iconColor: "text-red-500", bg: "bg-red-50" },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                      {item.icon ? (
                        <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                      ) : (
                        <div className={`w-6 h-6 rounded-full ${item.pulseColor} ${i === 1 ? "animate-pulse" : ""}`}></div>
                      )}
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{item.label}</dt>
                      <dd className="text-2xl font-bold text-gray-900">{item.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter section */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="px-6 py-6">
            <div className="flex items-center space-x-4 flex-wrap gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <FiFilter className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <label htmlFor="policy-filter" className="block text-sm font-medium text-gray-700 mb-2">Lọc theo hợp đồng</label>
                <select id="policy-filter" value={selectedPolicy} onChange={(e) => setSelectedPolicy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 rounded-xl shadow-sm transition-all duration-200">
                  <option value="">Tất cả hợp đồng</option>
                  {policies.map((policy) => (
                    <option key={policy.policyId} value={policy.policyId}>
                      Hợp đồng #{policy.policyId}{policy.vehicleBienSo ? ` — ${policy.vehicleBienSo}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "pending", label: "Chờ xử lý" },
                    { value: "approved", label: "Đã duyệt" },
                    { value: "rejected", label: "Từ chối" },
                    { value: "paid", label: "Đã chi trả" },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                        statusFilter === opt.value
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claims list */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                  <div className="h-6 bg-gray-100 rounded-xl w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-100 rounded-lg"></div>
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                    <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <FiTruck className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {claims.length === 0 ? "Bạn chưa có yêu cầu bồi thường nào" : "Không có yêu cầu nào khớp với bộ lọc"}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed text-sm">
              {claims.length === 0 ? "Hãy nộp yêu cầu bồi thường đầu tiên khi xảy ra sự cố với xe của bạn." : "Thử điều chỉnh bộ lọc để xem thêm yêu cầu bồi thường."}
            </p>
            {claims.length === 0 && (
              <button onClick={() => setSubmitClaimModalOpen(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                <FiFileText className="-ml-1 mr-2 h-5 w-5" />
                Nộp Yêu Cầu Đầu Tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClaims.map((claim) => (
              <ClaimCard key={claim.claimId} claim={claim} onProcess={() => handleProcessClaim(claim)} onRefresh={loadData} />
            ))}
          </div>
        )}
      </div>

      <SubmitClaimModal isOpen={submitClaimModalOpen} onClose={() => setSubmitClaimModalOpen(false)}
        policies={policies.filter((p) => p.status === 0)}
        onSuccess={() => { setSubmitClaimModalOpen(false); loadData(); }} />
      <ProcessClaimModal isOpen={processClaimModalOpen} onClose={() => setProcessClaimModalOpen(false)}
        claim={selectedClaim} onSuccess={() => { setProcessClaimModalOpen(false); loadData(); }} />
    </Layout>
  );
}
