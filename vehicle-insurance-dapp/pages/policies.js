import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import PolicyCard from "../components/Policies/PolicyCard";
import PayPremiumModal from "../components/Policies/PayPremiumModal";
import {
  contractService,
  POLICY_STATUS,
  PAYMENT_TYPES,
} from "../services/contract";
import {
  FiRefreshCw,
  FiShield,
  FiLock,
  FiZap,
  FiTrendingUp,
  FiBarChart,
  FiActivity,
  FiCheckCircle,
  FiFilter,
  FiAlertTriangle,
  FiFileText,
  FiPlusCircle,
  FiInfo,
  FiX,
} from "react-icons/fi";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// ─── Filter options ────────────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: String(POLICY_STATUS.ACTIVE), label: "Đang hiệu lực" },
  { value: String(POLICY_STATUS.EXPIRED), label: "Hết hạn" },
  { value: String(POLICY_STATUS.CANCELLED), label: "Đã hủy" },
  { value: String(POLICY_STATUS.SUSPENDED), label: "Tạm dừng" },
];

// ─── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ value, label, icon: Icon, gradient, bgGradient, textColor }) {
  return (
    <div className={`group relative bg-white/8 backdrop-blur-xl rounded-2xl p-5 shadow-md border border-white/8 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-center overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none`}></div>
      <div className="relative">
        <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md mx-auto mb-3`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <p className={`text-3xl font-bold ${textColor} mb-1`}>{value}</p>
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────
function PolicySkeleton() {
  return (
    <div className="animate-pulse bg-white/8 backdrop-blur-xl rounded-2xl shadow-md border border-white/8 p-6 overflow-hidden">
      <div className="flex items-center space-x-4 mb-5">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-white/10 rounded-lg w-2/3"></div>
          <div className="h-3.5 bg-white/10 rounded-lg w-1/2"></div>
        </div>
        <div className="h-6 bg-white/10 rounded-full w-24"></div>
      </div>
      <div className="space-y-3 mb-5">
        <div className="h-3.5 bg-white/10 rounded w-full"></div>
        <div className="h-3.5 bg-white/10 rounded w-4/5"></div>
        <div className="h-3.5 bg-white/10 rounded w-3/5"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="h-16 bg-white/10 rounded-xl"></div>
        <div className="h-16 bg-white/10 rounded-xl"></div>
      </div>
      <div className="flex space-x-2">
        <div className="h-9 bg-white/10 rounded-xl flex-1"></div>
        <div className="h-9 bg-white/10 rounded-xl flex-1"></div>
        <div className="h-9 bg-white/10 rounded-xl w-20"></div>
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ filterStatus }) {
  const isFiltered = filterStatus !== "all";
  return (
    <div className="col-span-full">
      <div className="relative bg-white/6 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-white/12 max-w-xl mx-auto overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/40 via-white/5 to-red-50/30 pointer-events-none"></div>
        <div className="relative">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center shadow-lg">
              <FiShield className="h-10 w-10 text-white/40" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <FiFileText className="h-4 w-4 text-white" />
            </div>
          </div>
          {isFiltered ? (
            <>
              <h3 className="text-xl font-bold text-white mb-3">
                Không có hợp đồng phù hợp
              </h3>
              <p className="text-white/50 mb-6 leading-relaxed">
                Không tìm thấy hợp đồng bảo hiểm nào với trạng thái đã chọn. Thử chọn bộ lọc khác.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white mb-3">
                Chưa có hợp đồng bảo hiểm
              </h3>
              <p className="text-white/50 mb-6 leading-relaxed">
                Bạn chưa mua gói bảo hiểm xe cơ giới nào. Hãy khám phá các gói bảo hiểm phù hợp với phương tiện của bạn.
              </p>
              <Link
                href="/plans"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <FiShield className="h-5 w-5" />
                <span>Xem Gói Bảo Hiểm</span>
              </Link>
              <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
                {[
                  { icon: FiLock, color: "text-red-400", text: "Bảo mật" },
                  { icon: FiZap, color: "text-emerald-400", text: "Nhanh chóng" },
                  { icon: FiCheckCircle, color: "text-purple-400", text: "Minh bạch" },
                ].map(({ icon: Icon, color, text }, i) => (
                  <div key={i} className="flex flex-col items-center p-3 bg-white/6 rounded-xl border border-white/60">
                    <Icon className={`h-5 w-5 ${color} mb-1.5`} />
                    <span className="font-semibold text-white/80">{text}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm cancel dialog (simple inline) ────────────────────────────────
function ConfirmCancelModal({ policyId, bienSo, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white/8 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/8 max-w-sm w-full p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/8 transition-colors"
        >
          <FiX className="h-4 w-4 text-white/50" />
        </button>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiAlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Hủy Hợp Đồng</h3>
        </div>
        <p className="text-sm text-white/60 mb-2 leading-relaxed">
          Bạn có chắc muốn hủy hợp đồng bảo hiểm cho xe{" "}
          <span className="font-bold text-white">{bienSo}</span>?
        </p>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
          <FiInfo className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300">
            Hành động này không thể hoàn tác. Hợp đồng sẽ bị hủy trên blockchain và bạn sẽ mất quyền bồi thường từ hôm nay.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white/8 hover:bg-white/10 text-white/80 font-semibold rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            Giữ lại
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 text-sm disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Đang hủy...</span>
              </>
            ) : (
              <span>Xác nhận hủy</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function Policies() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [enrichedPolicies, setEnrichedPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [payPremiumModalOpen, setPayPremiumModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [cancelTarget, setCancelTarget] = useState(null); // { policyId, bienSo }
  const [cancelLoading, setCancelLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isConnected && provider && address) {
      loadPolicies();
    }
  }, [isConnected, provider, address]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const userPolicies = await contractService.getUserPolicies(address, provider);

      const enriched = await Promise.all(
        (userPolicies || []).map(async (policy) => {
          try {
            const [remainingCoverage, claims] = await Promise.all([
              contractService.getRemainingCoverage(policy.policyId, provider),
              contractService.getPolicyClaims(policy.policyId, provider),
            ]);
            return {
              ...policy,
              remainingCoverage,
              claimsCount: Array.isArray(claims) ? claims.length : 0,
            };
          } catch {
            return { ...policy, remainingCoverage: policy.coverageAmount, claimsCount: 0 };
          }
        })
      );

      setPolicies(userPolicies || []);
      setEnrichedPolicies(enriched);
    } catch (error) {
      console.error("Lỗi khi tải danh sách hợp đồng:", error);
      setErrorMsg("Không thể tải danh sách hợp đồng. Vui lòng thử lại.");
      setPolicies([]);
      setEnrichedPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPremium = (policy) => {
    setSelectedPolicy(policy);
    setPayPremiumModalOpen(true);
  };

  const handleCancelRequest = (policy) => {
    setCancelTarget({ policyId: policy.policyId, bienSo: policy.vehicleBienSo });
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      setCancelLoading(true);
      const result = await contractService.huyHopDong(cancelTarget.policyId, signer);
      if (result && result.success !== false) {
        setCancelTarget(null);
        await loadPolicies();
      } else {
        alert("Không thể hủy hợp đồng. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi hủy hợp đồng:", error);
      alert("Lỗi khi hủy hợp đồng: " + (error.message || "Vui lòng thử lại."));
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────
  const totalPolicies = enrichedPolicies.length;
  const activePolicies = enrichedPolicies.filter((p) => p.status === POLICY_STATUS.ACTIVE).length;
  const totalCoverage = enrichedPolicies
    .reduce((sum, p) => sum + parseFloat(p.coverageAmount || 0), 0)
    .toFixed(3);
  const totalClaims = enrichedPolicies.reduce((sum, p) => sum + (p.claimsCount || 0), 0);

  // ── Filtered list ──────────────────────────────────────────────────────
  const filteredPolicies =
    filterStatus === "all"
      ? enrichedPolicies
      : enrichedPolicies.filter((p) => String(p.status) === filterStatus);

  // ─── Not connected ─────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          </div>
          <div className="relative text-center max-w-md mx-auto px-4">
            <div className="relative mx-auto mb-8 w-fit">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-red-900/40 to-orange-900/30 flex items-center justify-center shadow-2xl border border-white/12">
                <FiShield className="h-14 w-14 text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiLock className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="bg-white/8 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/12">
              <h3 className="text-2xl font-bold text-white mb-3">
                {t("wallet.connect_title")}
              </h3>
              <p className="text-white/60 mb-6 leading-relaxed">
                {t("wallet.connect_desc")}
              </p>
              <div className="space-y-3 text-left mb-6">
                {[
                  { icon: FiShield, color: "text-red-400", text: t("wallet.policies_feat_0") },
                  { icon: FiZap, color: "text-emerald-400", text: t("wallet.policies_feat_1") },
                  { icon: FiBarChart, color: "text-purple-400", text: t("wallet.policies_feat_2") },
                ].map(({ icon: Icon, color, text }, i) => (
                  <div key={i} className="flex items-center space-x-3 text-sm text-white/80">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start space-x-2">
                <FiInfo className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Vui lòng sử dụng nút kết nối ví ở góc trên bên phải trang.</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Main content ──────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-8">
        {/* ── Page Header ── */}
        <div className="relative bg-white/6 backdrop-blur-xl rounded-2xl p-7 shadow-xl border border-white/12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-white/5 to-orange-50/30 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FiShield className="h-7 w-7 text-white" />
                </div>
                {activePolicies > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {t("policies.title", "Hợp Đồng Bảo Hiểm")}
                </h1>
                <p className="text-white/50 text-sm mt-0.5">
                  {t("policies.subtitle", "Quản lý hợp đồng bảo hiểm xe của bạn")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-500/25 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-emerald-300">Blockchain Kết nối</span>
              </div>
              <button
                onClick={loadPolicies}
                disabled={loading}
                className="group inline-flex items-center space-x-2 px-4 py-2.5 border border-white/12 bg-white/8 hover:bg-white/8 backdrop-blur-xl rounded-xl text-sm font-semibold text-white/80 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <FiAlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-300">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <FiX className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}

        {/* ── Stats Cards ── */}
        {!loading && enrichedPolicies.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              value={totalPolicies}
              label="Tổng hợp đồng"
              icon={FiShield}
              gradient="from-red-500 to-red-600"
              bgGradient="from-red-50 to-red-50"
              textColor="text-red-400"
            />
            <StatCard
              value={activePolicies}
              label="Đang hiệu lực"
              icon={FiCheckCircle}
              gradient="from-emerald-500 to-green-500"
              bgGradient="from-emerald-900/20 to-green-900/15"
              textColor="text-emerald-400"
            />
            <StatCard
              value={`${totalCoverage} ETH`}
              label="Tổng quyền lợi"
              icon={FiTrendingUp}
              gradient="from-red-600 to-orange-500"
              bgGradient="from-red-50 to-orange-50"
              textColor="text-red-400"
            />
            <StatCard
              value={totalClaims}
              label="Tổng yêu cầu BT"
              icon={FiActivity}
              gradient="from-purple-500 to-violet-500"
              bgGradient="from-purple-50 to-violet-50"
              textColor="text-purple-400"
            />
          </div>
        )}

        {/* ── Filter Bar ── */}
        {!loading && enrichedPolicies.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/8 backdrop-blur-xl rounded-xl shadow-sm border border-white/8 px-5 py-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="h-4 w-4 text-white/40" />
              <span className="text-sm font-semibold text-white/80">Lọc theo trạng thái:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    filterStatus === opt.value
                      ? "bg-red-700 text-white shadow-md"
                      : "bg-white/8 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                  {opt.value !== "all" && (
                    <span className={`ml-1.5 ${filterStatus === opt.value ? "text-red-100" : "text-white/40"}`}>
                      ({enrichedPolicies.filter((p) => String(p.status) === opt.value).length})
                    </span>
                  )}
                  {opt.value === "all" && (
                    <span className={`ml-1.5 ${filterStatus === opt.value ? "text-red-100" : "text-white/40"}`}>
                      ({enrichedPolicies.length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Policies Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <PolicySkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPolicies.length === 0 ? (
              <EmptyState filterStatus={filterStatus} />
            ) : (
              filteredPolicies.map((policy, index) => (
                <div
                  key={policy.policyId}
                  className="transition-all duration-300"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <PolicyCard
                    policy={policy}
                    onPayPremium={
                      policy.paymentType === PAYMENT_TYPES.MONTHLY &&
                      policy.status === POLICY_STATUS.ACTIVE
                        ? () => handlePayPremium(policy)
                        : null
                    }
                    onCancel={
                      policy.status === POLICY_STATUS.ACTIVE
                        ? () => handleCancelRequest(policy)
                        : null
                    }
                    onRefresh={loadPolicies}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Bottom insight bar (shown when policies exist) ── */}
        {!loading && enrichedPolicies.length > 0 && (
          <div className="bg-white/8 backdrop-blur-xl rounded-2xl shadow-sm border border-white/8 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <div className="flex items-center space-x-2 text-white/60">
                <FiLock className="h-4 w-4 text-red-400" />
                <span>
                  Tất cả hợp đồng được bảo mật bằng smart contract trên blockchain
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 font-semibold">
                  Xác minh thời gian thực đang hoạt động
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick action — buy new policy ── */}
        {!loading && enrichedPolicies.length > 0 && (
          <div className="bg-gradient-to-r from-red-700 to-orange-600 rounded-2xl p-6 shadow-xl overflow-hidden relative text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1),_transparent_60%)] pointer-events-none"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-left">
                <h3 className="text-lg font-bold text-white mb-1">
                  Cần bảo hiểm thêm cho xe khác?
                </h3>
                <p className="text-red-100 text-sm">
                  Mua thêm gói bảo hiểm cho phương tiện của bạn chỉ trong vài phút.
                </p>
              </div>
              <Link
                href="/plans"
                className="inline-flex items-center space-x-2 px-5 py-3 bg-white text-red-400 font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm whitespace-nowrap"
              >
                <FiPlusCircle className="h-5 w-5" />
                <span>Mua Thêm Bảo Hiểm</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pay Premium Modal */}
      <PayPremiumModal
        isOpen={payPremiumModalOpen}
        onClose={() => setPayPremiumModalOpen(false)}
        policy={selectedPolicy}
        onSuccess={() => {
          setPayPremiumModalOpen(false);
          loadPolicies();
        }}
      />

      {/* Confirm Cancel Modal */}
      {cancelTarget && (
        <ConfirmCancelModal
          policyId={cancelTarget.policyId}
          bienSo={cancelTarget.bienSo}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          loading={cancelLoading}
        />
      )}
    </Layout>
  );
}






