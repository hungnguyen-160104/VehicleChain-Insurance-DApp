import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import ClaimCard from "../components/Claims/ClaimCard";
import SubmitClaimModal from "../components/Claims/SubmitClaimModal";
import ProcessClaimModal from "../components/Claims/ProcessClaimModal";
import { contractService, CLAIM_STATUS } from "../services/contract";
import {
  FiRefreshCw,
  FiFileText,
  FiPlus,
  FiFilter,
  FiLock,
  FiShield,
  FiZap,
  FiActivity,
  FiTrendingUp,
  FiTruck,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function Claims() {
  const { t } = useTranslation();
  const router = useRouter();
  const { policyId } = router.query;
  const { address, isConnected } = useAccount();
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
    if (isConnected && provider && address) {
      loadData();
    }
  }, [isConnected, provider, address]);

  useEffect(() => {
    if (policyId && policies.length > 0) {
      setSelectedPolicy(policyId);
    }
  }, [policyId, policies]);

  useEffect(() => {
    applyFilters();
  }, [claims, selectedPolicy, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Tải danh sách hợp đồng bảo hiểm của người dùng
      const userPolicies = await contractService.getUserPolicies(
        address,
        provider
      );
      setPolicies(userPolicies);

      // Tải tất cả yêu cầu bồi thường theo từng hợp đồng
      let allClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(
          policy.policyId,
          provider
        );
        // Bổ sung biển số xe vào mỗi yêu cầu bồi thường
        const enrichedClaims = policyClaims.map((claim) => ({
          ...claim,
          vehicleBienSo: claim.vehicleBienSo || policy.vehicleBienSo || "",
        }));
        allClaims = [...allClaims, ...enrichedClaims];
      }

      setClaims(allClaims);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu yêu cầu bồi thường:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...claims];

    if (selectedPolicy) {
      filtered = filtered.filter(
        (claim) => claim.policyId.toString() === selectedPolicy.toString()
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        filtered = filtered.filter((claim) =>
          [
            CLAIM_STATUS.PENDING,
            CLAIM_STATUS.DANG_GIAM_DINH,
            CLAIM_STATUS.CHO_HO_SO,
            CLAIM_STATUS.DANG_THAM_DINH,
          ].includes(Number(claim.status))
        );
      } else if (statusFilter === "approved") {
        filtered = filtered.filter(
          (claim) => Number(claim.status) === CLAIM_STATUS.APPROVED
        );
      } else if (statusFilter === "rejected") {
        filtered = filtered.filter(
          (claim) => Number(claim.status) === CLAIM_STATUS.REJECTED
        );
      } else if (statusFilter === "paid") {
        filtered = filtered.filter(
          (claim) => Number(claim.status) === CLAIM_STATUS.PAID
        );
      }
    }

    // Sắp xếp theo ngày nộp mới nhất
    filtered.sort(
      (a, b) => parseInt(b.submissionDate) - parseInt(a.submissionDate)
    );

    setFilteredClaims(filtered);
  };

  const handleProcessClaim = (claim) => {
    setSelectedClaim(claim);
    setProcessClaimModalOpen(true);
  };

  const getClaimStats = () => {
    const pendingStatuses = [
      CLAIM_STATUS.PENDING,
      CLAIM_STATUS.DANG_GIAM_DINH,
      CLAIM_STATUS.CHO_HO_SO,
      CLAIM_STATUS.DANG_THAM_DINH,
    ];
    return {
      total: claims.length,
      pending: claims.filter((c) =>
        pendingStatuses.includes(Number(c.status))
      ).length,
      approved: claims.filter(
        (c) =>
          Number(c.status) === CLAIM_STATUS.APPROVED ||
          Number(c.status) === CLAIM_STATUS.PAID
      ).length,
      totalBoiThuong: claims.reduce((sum, claim) => {
        if (Number(claim.status) === CLAIM_STATUS.PAID) {
          return sum + parseFloat(claim.approvedAmount || 0);
        }
        return sum;
      }, 0),
    };
  };

  const stats = getClaimStats();

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
                <FiTruck className="h-16 w-16 text-red-400" />
              </div>

              {/* Chỉ báo nổi */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiActivity className="h-4 w-4 text-white" />
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
                  <span>{t("wallet.claims_feat_0")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-white/80">
                  <FiZap className="h-4 w-4 text-emerald-400" />
                  <span>{t("wallet.claims_feat_1")}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-white/80">
                  <FiLock className="h-4 w-4 text-purple-400" />
                  <span>{t("wallet.claims_feat_2")}</span>
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {t("claims.title", "Yêu Cầu Bồi Thường")}
            </h1>
            <p className="mt-2 text-white/60">
              {t("claims.subtitle", "Quản lý yêu cầu bồi thường của bạn")}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadData}
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
            <button
              onClick={() => setSubmitClaimModalOpen(true)}
              className="group relative inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-700 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="-ml-1 mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              {t("claims.submit_claim", "Nộp yêu cầu")}
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Thẻ thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tổng yêu cầu */}
          <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-orange-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-900/40 to-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiFileText className="h-6 w-6 text-red-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-white/50 truncate">
                      Tổng Yêu Cầu
                    </dt>
                    <dd className="text-2xl font-bold text-white">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Chờ xử lý */}
          <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse"></div>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-white/50 truncate">
                      Chờ Xử Lý
                    </dt>
                    <dd className="text-2xl font-bold text-white">
                      {stats.pending}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Đã duyệt */}
          <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-white/50 truncate">
                      Đã Duyệt
                    </dt>
                    <dd className="text-2xl font-bold text-white">
                      {stats.approved}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Tổng bồi thường */}
          <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-purple-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiTrendingUp className="h-6 w-6 text-red-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-white/50 truncate">
                      Tổng Bồi Thường
                    </dt>
                    <dd className="text-2xl font-bold text-white">
                      {stats.totalBoiThuong.toFixed(4)} ETH
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl">
          <div className="px-6 py-6">
            <div className="flex items-center space-x-4 flex-wrap gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                <FiFilter className="h-5 w-5 text-purple-400" />
              </div>

              {/* Lọc theo hợp đồng */}
              <div>
                <label
                  htmlFor="policy-filter"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  Lọc theo hợp đồng
                </label>
                <select
                  id="policy-filter"
                  value={selectedPolicy}
                  onChange={(e) => setSelectedPolicy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base bg-white/5 backdrop-blur-sm border border-white/12 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 rounded-xl shadow-sm transition-all duration-300"
                >
                  <option value="">Tất cả hợp đồng</option>
                  {policies.map((policy) => (
                    <option key={policy.policyId} value={policy.policyId}>
                      Hợp đồng #{policy.policyId}
                      {policy.vehicleBienSo ? ` — ${policy.vehicleBienSo}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc theo trạng thái — dạng tab button */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Trạng thái
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "pending", label: "Chờ xử lý" },
                    { value: "approved", label: "Đã duyệt" },
                    { value: "rejected", label: "Từ chối" },
                    { value: "paid", label: "Đã chi trả" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        statusFilter === opt.value
                          ? "bg-gradient-to-r from-red-700 to-orange-600 text-white shadow-md"
                          : "bg-white/6 text-white/60 border border-white/12 hover:bg-white/8 hover:shadow-sm"
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

        {/* Danh sách yêu cầu bồi thường */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-6">
                  <div className="h-6 bg-gradient-to-r from-white/10 to-white/15 rounded-xl w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-white/10 to-white/15 rounded-lg"></div>
                    <div className="h-4 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-1/2"></div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <div className="h-10 bg-gradient-to-r from-white/10 to-white/15 rounded-xl flex-1"></div>
                    <div className="h-10 bg-gradient-to-r from-white/10 to-white/15 rounded-xl flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="relative">
            {/* Nền trang trí */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-600/10 rounded-full blur-2xl animate-pulse"></div>
              <div
                className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>

            <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                <FiTruck className="h-10 w-10 text-white/40" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {claims.length === 0
                  ? "Bạn chưa có yêu cầu bồi thường nào"
                  : "Không có yêu cầu nào khớp với bộ lọc"}
              </h3>
              <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
                {claims.length === 0
                  ? "Hãy nộp yêu cầu bồi thường đầu tiên khi xảy ra sự cố với xe của bạn."
                  : "Thử điều chỉnh bộ lọc để xem thêm yêu cầu bồi thường."}
              </p>
              {claims.length === 0 && (
                <button
                  onClick={() => setSubmitClaimModalOpen(true)}
                  className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-700 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <FiFileText className="-ml-1 mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Nộp Yêu Cầu Đầu Tiên
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClaims.map((claim) => (
              <ClaimCard
                key={claim.claimId}
                claim={claim}
                onProcess={() => handleProcessClaim(claim)}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal nộp yêu cầu bồi thường */}
      <SubmitClaimModal
        isOpen={submitClaimModalOpen}
        onClose={() => setSubmitClaimModalOpen(false)}
        policies={policies.filter((p) => p.status === 0)} // Chỉ hợp đồng đang hiệu lực
        onSuccess={() => {
          setSubmitClaimModalOpen(false);
          loadData();
        }}
      />

      {/* Modal xử lý yêu cầu bồi thường */}
      <ProcessClaimModal
        isOpen={processClaimModalOpen}
        onClose={() => setProcessClaimModalOpen(false)}
        claim={selectedClaim}
        onSuccess={() => {
          setProcessClaimModalOpen(false);
          loadData();
        }}
      />
    </Layout>
  );
}





