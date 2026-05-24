import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import PurchaseModal from "../components/Plans/PurchaseModal";
import {
  contractService,
  INSURANCE_TYPES,
  INSURANCE_TYPE_LABELS,
  VEHICLE_TYPES,
  VEHICLE_TYPE_LABELS,
  PAYMENT_TYPES,
} from "../services/contract";
import {
  FiShield,
  FiTruck,
  FiUsers,
  FiUser,
  FiCheck,
  FiChevronDown,
  FiRefreshCw,
  FiZap,
  FiLock,
  FiAlertCircle,
  FiPlusCircle,
  FiInfo,
  FiCreditCard,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// ─── Static card metadata ────────────────────────────────────────────────────
const INSURANCE_CARDS = [
  {
    type: INSURANCE_TYPES.TNDS_BAT_BUOC,
    label: INSURANCE_TYPE_LABELS[0],
    icon: FiShield,
    color: "blue",
    badge: "Bắt buộc theo luật",
    badgeColor: "red",
    description: "Bảo hiểm trách nhiệm dân sự của chủ xe với bên thứ 3",
    features: [
      "Bồi thường thiệt hại người: 150tr/người/vụ",
      "Bồi thường tài sản ô tô: 100tr/vụ",
      "Bồi thường tài sản xe máy: 50tr/vụ",
      "Theo NĐ 67/2023/NĐ-CP",
      "Bắt buộc với mọi phương tiện",
    ],
    gradient: "from-red-600 to-red-700",
    bgGradient: "from-red-900/30 to-red-800/20",
    borderColor: "border-red-500/25",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    btnGradient: "from-red-700 to-red-700 hover:from-red-700 hover:to-red-800",
    ringColor: "focus:ring-red-500/50",
  },
  {
    type: INSURANCE_TYPES.VAT_CHAT_XE,
    label: INSURANCE_TYPE_LABELS[1],
    icon: FiTruck,
    color: "green",
    badge: "Phổ biến nhất",
    badgeColor: "green",
    description: "Bảo hiểm thiệt hại vật chất thân vỏ xe của bạn",
    features: [
      "Phí 1.5% giá trị xe/năm",
      "Bồi thường 100% giá trị xe",
      "Va chạm, tai nạn, lật xe",
      "Mất cắp toàn bộ xe",
      "Thiên tai, bão lũ (tùy điều khoản)",
    ],
    gradient: "from-green-500 to-emerald-700",
    bgGradient: "from-green-900/30 to-emerald-900/20",
    borderColor: "border-green-500/25",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
    btnGradient: "from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800",
    ringColor: "focus:ring-green-500",
  },
  {
    type: INSURANCE_TYPES.NGUOI_TREN_XE,
    label: INSURANCE_TYPE_LABELS[2],
    icon: FiUsers,
    color: "purple",
    badge: null,
    badgeColor: null,
    description: "Bảo vệ hành khách và người ngồi trên xe",
    features: [
      "Bồi thường tối đa 0.5 ETH/người",
      "Tối đa 5 người/vụ",
      "Tai nạn trong quá trình di chuyển",
      "Tử vong, thương tật vĩnh viễn",
      "Chi phí y tế, phục hồi",
    ],
    gradient: "from-purple-500 to-violet-700",
    bgGradient: "from-purple-900/30 to-violet-900/20",
    borderColor: "border-purple-500/25",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    btnGradient: "from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800",
    ringColor: "focus:ring-purple-500",
  },
  {
    type: INSURANCE_TYPES.TAI_NAN_LAI_XE,
    label: INSURANCE_TYPE_LABELS[3],
    icon: FiUser,
    color: "orange",
    badge: null,
    badgeColor: null,
    description: "Bảo hiểm tai nạn cá nhân cho lái xe và phụ xe",
    features: [
      "Bồi thường 0.3 ETH/người",
      "Tai nạn khi lái hoặc phụ xe",
      "Tử vong, thương tật",
      "Chi phí cứu thương",
      "Không giới hạn số vụ/năm",
    ],
    gradient: "from-orange-500 to-amber-600",
    bgGradient: "from-orange-900/30 to-amber-900/20",
    borderColor: "border-orange-500/25",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    btnGradient: "from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700",
    ringColor: "focus:ring-orange-500",
  },
];

const FAQ_ITEMS = [
  {
    question: "Bảo hiểm TNDS bắt buộc là gì?",
    answer:
      "Bảo hiểm trách nhiệm dân sự (TNDS) bắt buộc là loại bảo hiểm mà theo quy định pháp luật, chủ xe cơ giới bắt buộc phải mua. Bảo hiểm này bảo vệ chủ xe khi xảy ra tai nạn gây thiệt hại cho bên thứ ba (người và tài sản).",
    icon: FiShield,
    gradient: "from-red-600 to-orange-500",
  },
  {
    question: "Phí bảo hiểm được thanh toán như thế nào?",
    answer:
      "Bạn có thể thanh toán phí bảo hiểm bằng ETH qua ví MetaMask. Hệ thống hỗ trợ 2 hình thức: thanh toán một lần toàn bộ phí năm hoặc thanh toán theo tháng.",
    icon: FiCreditCard,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    question: "Hợp đồng bảo hiểm có hiệu lực từ khi nào?",
    answer:
      "Hợp đồng bảo hiểm có hiệu lực ngay sau khi giao dịch blockchain được xác nhận và phí bảo hiểm được thanh toán thành công. Thông tin hợp đồng được lưu trên blockchain minh bạch, không thể sửa đổi.",
    icon: FiCalendar,
    gradient: "from-purple-500 to-violet-500",
  },
  {
    question: "Làm thế nào để nộp yêu cầu bồi thường?",
    answer:
      "Khi xảy ra tai nạn, bạn vào trang 'Yêu Cầu Bồi Thường', chọn hợp đồng liên quan và điền thông tin vụ tai nạn kèm bằng chứng. Yêu cầu sẽ được xử lý qua smart contract một cách minh bạch.",
    icon: FiFileText,
    gradient: "from-orange-500 to-amber-500",
  },
];

// ─── Price display helper ──────────────────────────────────────────────────
function PriceDisplay({ prices, insuranceType, loadingPrices }) {
  if (loadingPrices) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="h-5 w-24 bg-white/10 rounded"></div>
      </div>
    );
  }
  const p = prices[insuranceType];
  if (!p) {
    return <span className="text-sm text-white/40 italic">Chọn xe để xem giá</span>;
  }
  return (
    <div className="space-y-1">
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold text-white">{p.oneTime}</span>
        <span className="text-sm text-white/50">ETH/năm</span>
      </div>
      <div className="text-xs text-white/50">
        hoặc <span className="font-semibold text-white/80">{p.monthly} ETH/tháng</span>
      </div>
    </div>
  );
}

// ─── Badge component ──────────────────────────────────────────────────────
function CardBadge({ badge, badgeColor }) {
  if (!badge) return null;
  const colors = {
    red: "bg-red-500/20 text-red-300 border border-red-500/25",
    green: "bg-green-500/20 text-green-300 border border-green-500/25",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[badgeColor] || "bg-white/8 text-white/80"}`}>
      {badge}
    </span>
  );
}

// ─── Insurance Card ───────────────────────────────────────────────────────
function InsuranceCard({ card, prices, loadingPrices, selectedVehicle, onBuy }) {
  const Icon = card.icon;
  return (
    <div className={`relative flex flex-col bg-white/8 backdrop-blur-xl rounded-2xl shadow-lg border ${card.borderColor} overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
      {/* Card header */}
      <div className={`bg-gradient-to-br ${card.bgGradient} px-6 pt-6 pb-4`}>
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
            <Icon className={`h-6 w-6 ${card.iconColor}`} />
          </div>
          <CardBadge badge={card.badge} badgeColor={card.badgeColor} />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{card.label}</h3>
        <p className="text-sm text-white/60 leading-relaxed">{card.description}</p>
      </div>

      {/* Price section */}
      <div className="px-6 py-4 border-b border-white/8">
        <PriceDisplay
          prices={prices}
          insuranceType={card.type}
          loadingPrices={loadingPrices}
        />
      </div>

      {/* Features */}
      <div className="flex-1 px-6 py-4">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
          Quyền lợi bảo hiểm
        </p>
        <ul className="space-y-2">
          {card.features.map((feature, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-sm text-white/80">
              <FiCheck className={`h-4 w-4 mt-0.5 flex-shrink-0 ${card.iconColor}`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onBuy(card)}
          disabled={!selectedVehicle}
          className={`w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r ${card.btnGradient} text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${card.ringColor}`}
        >
          {!selectedVehicle ? (
            <>
              <FiChevronDown className="mr-2 h-4 w-4" />
              Chọn xe trước
            </>
          ) : (
            <>
              <FiShield className="mr-2 h-4 w-4" />
              Mua Bảo Hiểm
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function InsurancePlans() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(false);
  const [userVehicles, setUserVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [prices, setPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Load vehicles when connected
  useEffect(() => {
    if (isConnected && provider && address) {
      loadVehicles();
    }
  }, [isConnected, provider, address]);

  // Recalculate prices when vehicle changes
  useEffect(() => {
    if (selectedVehicle && provider) {
      loadPrices(selectedVehicle.bienSo);
    } else {
      setPrices({});
    }
  }, [selectedVehicle, provider]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehicles = await contractService.getUserVehicles(address, provider);
      setUserVehicles(vehicles || []);
      if (vehicles && vehicles.length > 0) {
        setSelectedVehicle(vehicles[0]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách xe:", error);
      setUserVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPrices = async (bienSo) => {
    try {
      setLoadingPrices(true);
      const allTypes = [
        INSURANCE_TYPES.TNDS_BAT_BUOC,
        INSURANCE_TYPES.VAT_CHAT_XE,
        INSURANCE_TYPES.NGUOI_TREN_XE,
        INSURANCE_TYPES.TAI_NAN_LAI_XE,
      ];

      const results = await Promise.allSettled(
        allTypes.map(async (type) => {
          const [oneTimeRaw, monthlyRaw] = await Promise.all([
            contractService.tinhPhiBaoHiem(bienSo, type, PAYMENT_TYPES.ONE_TIME, provider),
            contractService.tinhPhiBaoHiem(bienSo, type, PAYMENT_TYPES.MONTHLY, provider),
          ]);
          return { type, oneTime: oneTimeRaw, monthly: monthlyRaw };
        })
      );

      const newPrices = {};
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const { type, oneTime, monthly } = result.value;
          newPrices[type] = {
            oneTime: typeof oneTime === "string" ? oneTime : String(oneTime),
            monthly: typeof monthly === "string" ? monthly : String(monthly),
          };
        }
      });
      setPrices(newPrices);
    } catch (error) {
      console.error("Lỗi khi tính phí bảo hiểm:", error);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleBuy = (card) => {
    if (!isConnected) {
      alert("Vui lòng kết nối ví trước!");
      return;
    }
    if (!selectedVehicle) {
      alert("Vui lòng chọn xe để tiếp tục.");
      return;
    }
    setSelectedInsuranceType(card.type);
    setPurchaseModalOpen(true);
  };

  // ── Not connected state ───────────────────────────────────────────────
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
                  { icon: FiShield, color: "text-red-400", text: t("wallet.plans_feat_0") },
                  { icon: FiZap, color: "text-emerald-400", text: t("wallet.plans_feat_1") },
                  { icon: FiCheckCircle, color: "text-purple-400", text: t("wallet.plans_feat_2") },
                ].map(({ icon: Icon, color, text }, i) => (
                  <div key={i} className="flex items-center space-x-3 text-sm text-white/80">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start space-x-2">
                <FiInfo className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{t("wallet.connect_hint", "Vui lòng sử dụng nút kết nối ví ở góc trên bên phải trang.")}</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Main content ──────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-12">
        {/* ── Hero Header ── */}
        <div className="relative bg-white/6 backdrop-blur-xl rounded-3xl p-10 lg:p-14 shadow-2xl border border-white/12 overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/40 via-white/5 to-orange-50/40 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative">
            <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 text-red-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <FiCheckCircle className="h-4 w-4" />
              <span>{t("plans.regulation")}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("plans.title", "Gói Bảo Hiểm")}
              <span className="block bg-gradient-to-r from-red-700 via-red-700 to-orange-600 bg-clip-text text-transparent">
                {t("plans.title2")}
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
              {t("plans.subtitle", "Chọn loại bảo hiểm phù hợp với xe của bạn")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-white/60">
              {[
                { icon: FiLock, color: "text-red-400", text: t("plans.header_tag_0") },
                { icon: FiZap, color: "text-emerald-400", text: t("plans.header_tag_1") },
                { icon: FiFileText, color: "text-purple-400", text: t("plans.header_tag_2") },
              ].map(({ icon: Icon, color, text }, i) => (
                <div key={i} className="flex items-center space-x-2 px-4 py-2 bg-white/6 rounded-full border border-white/12">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Vehicle Selector ── */}
        <div className="bg-white/8 backdrop-blur-xl rounded-2xl shadow-md border border-white/8 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white mb-1">
                Chọn phương tiện để tính phí
              </h2>
              <p className="text-sm text-white/50">
                Phí bảo hiểm được tính dựa trên loại xe đã đăng ký
              </p>
            </div>

            {loading ? (
              <div className="flex items-center space-x-2 text-sm text-white/50 animate-pulse">
                <FiRefreshCw className="h-4 w-4 animate-spin" />
                <span>Đang tải danh sách xe...</span>
              </div>
            ) : userVehicles.length > 0 ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select
                    value={selectedVehicle?.bienSo || ""}
                    onChange={(e) => {
                      const v = userVehicles.find((x) => x.bienSo === e.target.value);
                      setSelectedVehicle(v || null);
                    }}
                    className="appearance-none w-full sm:w-72 pl-4 pr-10 py-2.5 bg-white/8 border border-white/15 rounded-xl text-sm font-medium text-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 cursor-pointer"
                  >
                    {userVehicles.map((v) => (
                      <option key={v.bienSo} value={v.bienSo}>
                        {v.bienSo} — {VEHICLE_TYPE_LABELS[v.vehicleType] || "Không xác định"}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                </div>
                <button
                  onClick={loadVehicles}
                  disabled={loading}
                  title="Làm mới danh sách xe"
                  className="p-2.5 bg-white/8 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw className={`h-4 w-4 text-white/60 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-900/20 border border-amber-500/20 rounded-xl px-4 py-2.5">
                  <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Bạn chưa có xe nào đã đăng ký</span>
                </div>
              </div>
            )}
          </div>

          {selectedVehicle && (
            <div className="mt-4 pt-4 border-t border-white/8 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2 text-white/60">
                <span className="font-medium text-white/50">Biển số:</span>
                <span className="font-bold text-white bg-white/8 px-2 py-0.5 rounded-md">
                  {selectedVehicle.bienSo}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-white/60">
                <span className="font-medium text-white/50">Loại xe:</span>
                <span className="font-semibold text-white/90">
                  {VEHICLE_TYPE_LABELS[selectedVehicle.vehicleType] || "Không xác định"}
                </span>
              </div>
              {loadingPrices && (
                <div className="flex items-center space-x-2 text-red-400 animate-pulse">
                  <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-xs">Đang tính phí bảo hiểm...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── No vehicles — register prompt ── */}
        {!loading && userVehicles.length === 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-500/20 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FiTruck className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Đăng Ký Xe Mới
            </h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Bạn cần đăng ký phương tiện trước khi mua bảo hiểm. Việc đăng ký chỉ mất vài phút và hoàn toàn minh bạch trên blockchain.
            </p>
            <Link
              href="/vehicles"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <FiPlusCircle className="h-5 w-5" />
              <span>Đăng Ký Xe Ngay</span>
            </Link>
          </div>
        )}

        {/* ── Insurance Cards Grid ── */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Chọn Gói Bảo Hiểm Phù Hợp
            </h2>
            <p className="text-white/50 text-sm">
              {selectedVehicle
                ? `Giá phí dành cho xe ${selectedVehicle.bienSo}`
                : "Vui lòng chọn xe để xem phí bảo hiểm tương ứng"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {INSURANCE_CARDS.map((card) => (
              <InsuranceCard
                key={card.type}
                card={card}
                prices={prices}
                loadingPrices={loadingPrices}
                selectedVehicle={selectedVehicle}
                onBuy={handleBuy}
              />
            ))}
          </div>
        </div>

        {/* ── FAQ Section ── */}
        <div className="relative bg-white/6 backdrop-blur-xl rounded-3xl p-10 lg:p-14 shadow-xl border border-white/12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-white/5 to-orange-50/30 pointer-events-none"></div>
          <div className="relative">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                Câu Hỏi Thường Gặp
              </h2>
              <p className="text-white/60">
                Giải đáp thắc mắc về bảo hiểm xe cơ giới trên blockchain
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {FAQ_ITEMS.map((faq, index) => {
                const Icon = faq.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white/8 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-white/12 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4 mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${faq.gradient} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed pl-14">
                      {faq.answer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CTA Banner ── */}
        <div className="relative bg-gradient-to-r from-red-700 to-orange-600 rounded-3xl p-10 text-white shadow-2xl overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.12),_transparent_50%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(255,255,255,0.08),_transparent_50%)] pointer-events-none"></div>
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">
              {t("plans.cta_title")}
            </h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              {t("plans.cta_desc")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm opacity-90">
              {[
                { icon: FiShield, text: t("plans.cta_tag_0") },
                { icon: FiZap, text: t("plans.cta_tag_1") },
                { icon: FiCheckCircle, text: t("plans.cta_tag_2") },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        vehicle={selectedVehicle}
        insuranceType={selectedInsuranceType}
        prices={prices}
        onSuccess={() => {
          setPurchaseModalOpen(false);
        }}
      />
    </Layout>
  );
}







