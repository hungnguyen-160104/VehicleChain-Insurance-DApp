import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import PolicyCard from "../components/Policies/PolicyCard";
import PayPremiumModal from "../components/Policies/PayPremiumModal";
import { contractService, POLICY_STATUS, PAYMENT_TYPES } from "../services/contract";
import {
  FiRefreshCw, FiShield, FiLock, FiZap, FiTrendingUp,
  FiBarChart, FiActivity, FiCheckCircle, FiFilter,
  FiAlertTriangle, FiFileText, FiPlusCircle, FiInfo, FiX,
} from "react-icons/fi";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: String(POLICY_STATUS.ACTIVE), label: "Đang hiệu lực" },
  { value: String(POLICY_STATUS.EXPIRED), label: "Hết hạn" },
  { value: String(POLICY_STATUS.CANCELLED), label: "Đã hủy" },
  { value: String(POLICY_STATUS.SUSPENDED), label: "Tạm dừng" },
];

function StatCard({ value, label, icon: Icon, gradient, textColor }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-center">
      <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-sm mx-auto mb-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className={`text-3xl font-bold ${textColor} mb-1`}>{value}</p>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function PolicySkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-4 mb-5">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-100 rounded-lg w-2/3"></div>
          <div className="h-3.5 bg-gray-100 rounded-lg w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-100 rounded-full w-24"></div>
      </div>
      <div className="space-y-3 mb-5">
        <div className="h-3.5 bg-gray-100 rounded w-full"></div>
        <div className="h-3.5 bg-gray-100 rounded w-4/5"></div>
        <div className="h-3.5 bg-gray-100 rounded w-3/5"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="h-16 bg-gray-100 rounded-xl"></div>
        <div className="h-16 bg-gray-100 rounded-xl"></div>
      </div>
      <div className="flex space-x-2">
        <div className="h-9 bg-gray-100 rounded-xl flex-1"></div>
        <div className="h-9 bg-gray-100 rounded-xl flex-1"></div>
        <div className="h-9 bg-gray-100 rounded-xl w-20"></div>
      </div>
    </div>
  );
}

function EmptyState({ filterStatus }) {
  const isFiltered = filterStatus !== "all";
  return (
    <div className="col-span-full">
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 max-w-xl mx-auto text-center">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center shadow-sm">
            <FiShield className="h-10 w-10 text-gray-300" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md">
            <FiFileText className="h-4 w-4 text-white" />
          </div>
        </div>
        {isFiltered ? (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Không có hợp đồng phù hợp</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-sm">Không tìm thấy hợp đồng bảo hiểm nào với trạng thái đã chọn.</p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Chưa có hợp đồng bảo hiểm</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-sm">
              Bạn chưa mua gói bảo hiểm xe cơ giới nào. Hãy khám phá các gói bảo hiểm phù hợp.
            </p>
            <Link href="/plans" className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:shadow-lg">
              <FiShield className="h-5 w-5" />
              <span>Xem Gói Bảo Hiểm</span>
            </Link>
            <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
              {[
                { icon: FiLock, color: "text-red-500", bg: "bg-red-50", text: "Bảo mật" },
                { icon: FiZap, color: "text-emerald-500", bg: "bg-emerald-50", text: "Nhanh chóng" },
                { icon: FiCheckCircle, color: "text-purple-500", bg: "bg-purple-50", text: "Minh bạch" },
              ].map(({ icon: Icon, color, bg, text }, i) => (
                <div key={i} className={`flex flex-col items-center p-3 ${bg} rounded-xl`}>
                  <Icon className={`h-5 w-5 ${color} mb-1.5`} />
                  <span className="font-semibold text-gray-700">{text}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ConfirmCancelModal({ policyId, bienSo, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full p-6 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <FiX className="h-4 w-4 text-gray-400" />
        </button>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiAlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Hủy Hợp Đồng</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          Bạn có chắc muốn hủy hợp đồng bảo hiểm cho xe{" "}
          <span className="font-bold text-gray-900">{bienSo}</span>?
        </p>
        <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <FiInfo className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">Hành động này không thể hoàn tác. Hợp đồng sẽ bị hủy trên blockchain.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 border border-gray-200">
            Giữ lại
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 text-sm disabled:opacity-60 flex items-center justify-center space-x-2">
            {loading ? (
              <><FiRefreshCw className="h-3.5 w-3.5 animate-spin" /><span>Đang hủy...</span></>
            ) : <span>Xác nhận hủy</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isConnected && provider && address) loadPolicies();
  }, [isConnected, provider, address]);

  const loadPolicies = async () => {
    try {
      setLoading(true); setErrorMsg(null);
      const userPolicies = await contractService.getUserPolicies(address, provider);
      const enriched = await Promise.all((userPolicies || []).map(async (policy) => {
        try {
          const [remainingCoverage, claims] = await Promise.all([
            contractService.getRemainingCoverage(policy.policyId, provider),
            contractService.getPolicyClaims(policy.policyId, provider),
          ]);
          return { ...policy, remainingCoverage, claimsCount: Array.isArray(claims) ? claims.length : 0 };
        } catch {
          return { ...policy, remainingCoverage: policy.coverageAmount, claimsCount: 0 };
        }
      }));
      setPolicies(userPolicies || []);
      setEnrichedPolicies(enriched);
    } catch (error) {
      console.error("Lỗi:", error);
      setErrorMsg("Không thể tải danh sách hợp đồng. Vui lòng thử lại.");
      setPolicies([]); setEnrichedPolicies([]);
    } finally { setLoading(false); }
  };

  const handlePayPremium = (policy) => { setSelectedPolicy(policy); setPayPremiumModalOpen(true); };
  const handleCancelRequest = (policy) => { setCancelTarget({ policyId: policy.policyId, bienSo: policy.vehicleBienSo }); };
  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      setCancelLoading(true);
      const result = await contractService.huyHopDong(cancelTarget.policyId, signer);
      if (result && result.success !== false) { setCancelTarget(null); await loadPolicies(); }
      else alert("Không thể hủy hợp đồng. Vui lòng thử lại.");
    } catch (error) {
      alert("Lỗi: " + (error.message || "Vui lòng thử lại."));
    } finally { setCancelLoading(false); }
  };

  const totalPolicies = enrichedPolicies.length;
  const activePolicies = enrichedPolicies.filter((p) => p.status === POLICY_STATUS.ACTIVE).length;
  const totalCoverage = enrichedPolicies.reduce((sum, p) => sum + parseFloat(p.coverageAmount || 0), 0).toFixed(3);
  const totalClaims = enrichedPolicies.reduce((sum, p) => sum + (p.claimsCount || 0), 0);
  const filteredPolicies = filterStatus === "all" ? enrichedPolicies : enrichedPolicies.filter((p) => String(p.status) === filterStatus);

  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          <div className="relative text-center max-w-md mx-auto px-4">
            <div className="relative mx-auto mb-8 w-fit">
              <div className="w-28 h-28 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
                <FiShield className="h-14 w-14 text-red-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md animate-pulse">
                <FiLock className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("wallet.connect_title")}</h3>
              <p className="text-gray-500 mb-6 leading-relaxed text-sm">{t("wallet.connect_desc")}</p>
              <div className="space-y-3 text-left mb-6">
                {[
                  { icon: FiShield, color: "text-red-500", text: t("wallet.policies_feat_0") },
                  { icon: FiZap, color: "text-emerald-500", text: t("wallet.policies_feat_1") },
                  { icon: FiBarChart, color: "text-purple-500", text: t("wallet.policies_feat_2") },
                ].map(({ icon: Icon, color, text }, i) => (
                  <div key={i} className="flex items-center space-x-3 text-sm text-gray-600">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} /><span>{text}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2">
                <FiInfo className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                <span className="text-xs text-amber-700">Vui lòng sử dụng nút kết nối ví ở góc trên bên phải trang.</span>
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
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
                  <FiShield className="h-7 w-7 text-white" />
                </div>
                {activePolicies > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("policies.title", "Hợp Đồng Bảo Hiểm")}</h1>
                <p className="text-gray-500 text-sm mt-0.5">{t("policies.subtitle", "Quản lý hợp đồng bảo hiểm xe của bạn")}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-emerald-700">Blockchain Kết nối</span>
              </div>
              <button onClick={loadPolicies} disabled={loading}
                className="group inline-flex items-center space-x-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50">
                <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <FiAlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
            </div>
            <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
              <FiX className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && enrichedPolicies.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value={totalPolicies} label="Tổng hợp đồng" icon={FiShield} gradient="from-red-500 to-red-600" textColor="text-red-600" />
            <StatCard value={activePolicies} label="Đang hiệu lực" icon={FiCheckCircle} gradient="from-emerald-500 to-green-500" textColor="text-emerald-600" />
            <StatCard value={`${totalCoverage} ETH`} label="Tổng quyền lợi" icon={FiTrendingUp} gradient="from-red-600 to-orange-500" textColor="text-red-600" />
            <StatCard value={totalClaims} label="Tổng yêu cầu BT" icon={FiActivity} gradient="from-purple-500 to-violet-500" textColor="text-purple-600" />
          </div>
        )}

        {/* Filter Bar */}
        {!loading && enrichedPolicies.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Lọc theo trạng thái:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setFilterStatus(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                    filterStatus === opt.value
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                  {opt.value !== "all" && (
                    <span className={`ml-1.5 ${filterStatus === opt.value ? "text-red-100" : "text-gray-400"}`}>
                      ({enrichedPolicies.filter((p) => String(p.status) === opt.value).length})
                    </span>
                  )}
                  {opt.value === "all" && (
                    <span className={`ml-1.5 ${filterStatus === opt.value ? "text-red-100" : "text-gray-400"}`}>
                      ({enrichedPolicies.length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Policies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <PolicySkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPolicies.length === 0 ? (
              <EmptyState filterStatus={filterStatus} />
            ) : (
              filteredPolicies.map((policy, index) => (
                <div key={policy.policyId} className="transition-all duration-300" style={{ animationDelay: `${index * 80}ms` }}>
                  <PolicyCard
                    policy={policy}
                    onPayPremium={policy.paymentType === PAYMENT_TYPES.MONTHLY && policy.status === POLICY_STATUS.ACTIVE ? () => handlePayPremium(policy) : null}
                    onCancel={policy.status === POLICY_STATUS.ACTIVE ? () => handleCancelRequest(policy) : null}
                    onRefresh={loadPolicies}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* Bottom insight bar */}
        {!loading && enrichedPolicies.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-500">
                <FiLock className="h-4 w-4 text-red-500" />
                <span>Tất cả hợp đồng được bảo mật bằng smart contract trên blockchain</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-600 font-semibold text-sm">Xác minh thời gian thực đang hoạt động</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick action — buy new policy */}
        {!loading && enrichedPolicies.length > 0 && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1),_transparent_60%)]"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-left">
                <h3 className="text-lg font-bold text-white mb-1">Cần bảo hiểm thêm cho xe khác?</h3>
                <p className="text-red-100 text-sm">Mua thêm gói bảo hiểm chỉ trong vài phút.</p>
              </div>
              <Link href="/plans" className="inline-flex items-center space-x-2 px-5 py-3 bg-white text-red-600 font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm whitespace-nowrap">
                <FiPlusCircle className="h-5 w-5" />
                <span>Mua Thêm Bảo Hiểm</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <PayPremiumModal isOpen={payPremiumModalOpen} onClose={() => setPayPremiumModalOpen(false)} policy={selectedPolicy}
        onSuccess={() => { setPayPremiumModalOpen(false); loadPolicies(); }} />
      {cancelTarget && (
        <ConfirmCancelModal policyId={cancelTarget.policyId} bienSo={cancelTarget.bienSo}
          onConfirm={handleCancelConfirm} onClose={() => setCancelTarget(null)} loading={cancelLoading} />
      )}
    </Layout>
  );
}
