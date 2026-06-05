import { useState, useEffect } from "react";
import {
  FiShield, FiDollarSign, FiInfo, FiCheck,
  FiTruck, FiUsers, FiActivity, FiEdit2, FiSave, FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

const DEFAULT_PLANS = [
  {
    id: 0,
    name: "TNDS Bắt Buộc",
    shortName: "TNDS",
    description: "Bảo hiểm trách nhiệm dân sự bắt buộc theo quy định pháp luật. Bồi thường thiệt hại cho bên thứ ba bị tai nạn.",
    icon: FiShield,
    color: "blue",
    legalBasis: "Nghị định 67/2023/NĐ-CP",
    mandatory: true,
    pricing: [
      { loaiXe: "Xe máy (dưới 50cc)", gia: "0.001 ETH/năm" },
      { loaiXe: "Xe máy (trên 50cc)", gia: "0.0015 ETH/năm" },
      { loaiXe: "Ô tô con (dưới 6 chỗ)", gia: "0.005 ETH/năm" },
      { loaiXe: "Ô tô (7-15 chỗ)", gia: "0.007 ETH/năm" },
      { loaiXe: "Xe tải nhẹ", gia: "0.008 ETH/năm" },
    ],
    coverage: [
      "Thiệt hại thân thể bên thứ ba: tối đa 150 triệu VNĐ/người",
      "Thiệt hại tài sản bên thứ ba: tối đa 100 triệu VNĐ/vụ",
      "Chi phí y tế khẩn cấp",
      "Hỗ trợ pháp lý cơ bản",
    ],
  },
  {
    id: 1,
    name: "Bảo Hiểm Vật Chất Xe",
    shortName: "Vật chất",
    description: "Bảo hiểm thiệt hại cho chính chiếc xe của bạn do tai nạn, va chạm, trộm cắp, thiên tai hoặc hỏa hoạn.",
    icon: FiTruck,
    color: "purple",
    legalBasis: "Tự nguyện - Luật kinh doanh bảo hiểm",
    mandatory: false,
    pricing: [
      { loaiXe: "Xe máy", gia: "1.5% giá trị xe/năm" },
      { loaiXe: "Ô tô con", gia: "1.5% giá trị xe/năm" },
      { loaiXe: "Xe tải", gia: "1.8% giá trị xe/năm" },
      { loaiXe: "Xe chuyên dụng", gia: "2.0% giá trị xe/năm" },
    ],
    coverage: [
      "Thiệt hại thân vỏ xe do tai nạn, va chạm",
      "Mất trộm toàn bộ xe",
      "Thiệt hại do thiên tai: lũ lụt, bão, sét đánh",
      "Thiệt hại do hỏa hoạn, nổ",
      "Chi phí kéo xe đến garage sửa chữa",
    ],
  },
  {
    id: 2,
    name: "Bảo Hiểm Người Trên Xe",
    shortName: "Người trên xe",
    description: "Bảo vệ tất cả hành khách ngồi trên xe khi xảy ra tai nạn giao thông. Bồi thường chi phí y tế và tử vong.",
    icon: FiUsers,
    color: "emerald",
    legalBasis: "Tự nguyện - Thông tư 22/2016/TT-BTC",
    mandatory: false,
    pricing: [
      { loaiXe: "Tất cả loại xe", gia: "0.002 ETH/người/năm" },
      { loaiXe: "Gói 4 người", gia: "0.007 ETH/năm" },
      { loaiXe: "Gói 7 người", gia: "0.012 ETH/năm" },
      { loaiXe: "Xe từ 8-15 người", gia: "0.002 ETH/người/năm" },
    ],
    coverage: [
      "Tử vong hoặc mất khả năng lao động vĩnh viễn: tối đa 100 triệu VNĐ",
      "Chi phí y tế điều trị tai nạn: tối đa 30 triệu VNĐ",
      "Phụ cấp nằm viện: 200.000 VNĐ/ngày",
      "Bồi thường thương tật tạm thời",
    ],
  },
  {
    id: 3,
    name: "Bảo Hiểm Tai Nạn Lái Xe",
    shortName: "Lái xe",
    description: "Bảo vệ lái xe khi xảy ra tai nạn trong quá trình điều khiển phương tiện.",
    icon: FiActivity,
    color: "orange",
    legalBasis: "Tự nguyện - Thông tư 22/2016/TT-BTC",
    mandatory: false,
    pricing: [
      { loaiXe: "Lái xe xe máy", gia: "0.001 ETH/năm" },
      { loaiXe: "Lái xe ô tô con", gia: "0.001 ETH/năm" },
      { loaiXe: "Lái xe tải/xe khách", gia: "0.0015 ETH/năm" },
      { loaiXe: "Gói lái + phụ xe", gia: "0.0025 ETH/năm" },
    ],
    coverage: [
      "Tử vong hoặc thương tật toàn bộ vĩnh viễn: tối đa 150 triệu VNĐ",
      "Thương tật bộ phận vĩnh viễn: theo tỷ lệ thương tật",
      "Chi phí y tế: tối đa 50 triệu VNĐ/vụ",
      "Trợ cấp nằm viện 200.000đ/ngày (tối đa 180 ngày)",
    ],
  },
];

const COLOR_MAP = {
  blue:    { text: "text-red-600",     border: "border-red-200",    badge: "bg-red-50 text-red-600 border-red-200",       header: "from-red-600 to-orange-600",     bg: "from-red-50 to-orange-50" },
  purple:  { text: "text-purple-600",  border: "border-purple-200", badge: "bg-purple-50 text-purple-700 border-purple-200", header: "from-purple-500 to-pink-600",  bg: "from-purple-50 to-pink-50" },
  emerald: { text: "text-emerald-600", border: "border-emerald-200",badge: "bg-emerald-50 text-emerald-700 border-emerald-200",header: "from-emerald-500 to-green-600",bg: "from-emerald-50 to-green-50" },
  orange:  { text: "text-orange-600",  border: "border-orange-200", badge: "bg-orange-50 text-orange-700 border-orange-200",  header: "from-orange-500 to-yellow-600",bg: "from-orange-50 to-yellow-50" },
};

const STORAGE_KEY = "vc_plan_pricing";

function loadSavedPricing() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function PlanManagement() {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editRows, setEditRows] = useState([]);

  useEffect(() => {
    const saved = loadSavedPricing();
    if (saved) {
      setPlans(prev => prev.map(p => saved[p.id] ? { ...p, pricing: saved[p.id] } : p));
    }
  }, []);

  const startEdit = (plan) => {
    setEditingPlan(plan.id);
    setEditRows(plan.pricing.map(r => ({ ...r })));
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    setEditRows([]);
  };

  const saveEdit = (planId) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, pricing: editRows } : p));
    const saved = loadSavedPricing() || {};
    saved[planId] = editRows;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    setEditingPlan(null);
    toast.success("Đã lưu thay đổi bảng phí!");
  };

  const updateRow = (idx, field, value) => {
    setEditRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const addRow = () => setEditRows(prev => [...prev, { loaiXe: "", gia: "" }]);
  const removeRow = (idx) => setEditRows(prev => prev.filter((_, i) => i !== idx));

  const resetPlan = (planId) => {
    const def = DEFAULT_PLANS.find(p => p.id === planId);
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, pricing: def.pricing } : p));
    const saved = loadSavedPricing() || {};
    delete saved[planId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    toast.success("Đã khôi phục phí mặc định!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Gói Bảo Hiểm</h2>
          <p className="text-gray-500 text-sm mt-0.5">Xem và chỉnh sửa bảng phí hiển thị cho từng gói bảo hiểm</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-medium">
          <FiInfo size={13} />
          Thay đổi phí được lưu cục bộ và hiển thị cho người dùng
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {plans.map(plan => {
          const c = COLOR_MAP[plan.color];
          const Icon = plan.icon;
          return (
            <div key={plan.id} className={`bg-white border ${c.border} rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${c.text}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${c.text}`}>Gói {plan.id}</p>
                  <p className="text-xs font-semibold text-gray-700 leading-tight">{plan.shortName}</p>
                </div>
              </div>
              {plan.mandatory && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-50 text-red-500 border border-red-200">
                  Bắt buộc
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail cards */}
      {plans.map(plan => {
        const c = COLOR_MAP[plan.color];
        const Icon = plan.icon;
        const isEditing = editingPlan === plan.id;

        return (
          <div key={plan.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            {/* Card header */}
            <div className={`bg-gradient-to-r ${c.header} px-8 py-5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      {plan.mandatory && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-white/30 text-white border border-white/40">
                          Bắt buộc
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-xs">{plan.legalBasis}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white/20 text-white border border-white/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                  Đang áp dụng
                </span>
              </div>
            </div>

            <div className="p-8">
              <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pricing */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiDollarSign className={`h-4 w-4 ${c.text}`} />
                      <h4 className="font-bold text-gray-900 text-sm">Bảng Phí Bảo Hiểm</h4>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(plan)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${c.badge} hover:opacity-80 transition-all`}
                      >
                        <FiEdit2 size={11} /> Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(plan.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all"
                        >
                          <FiSave size={11} /> Lưu
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all"
                        >
                          <FiX size={11} /> Hủy
                        </button>
                        <button
                          onClick={() => resetPlan(plan.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                        >
                          Mặc định
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {isEditing ? (
                      <>
                        {editRows.map((row, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              value={row.loaiXe}
                              onChange={e => updateRow(idx, "loaiXe", e.target.value)}
                              placeholder="Loại xe"
                              className={`flex-1 px-3 py-2 border ${c.border} rounded-lg text-xs focus:outline-none focus:ring-1`}
                            />
                            <input
                              value={row.gia}
                              onChange={e => updateRow(idx, "gia", e.target.value)}
                              placeholder="Giá"
                              className={`w-36 px-3 py-2 border ${c.border} rounded-lg text-xs font-semibold ${c.text} focus:outline-none focus:ring-1`}
                            />
                            <button
                              onClick={() => removeRow(idx)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <FiX size={13} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addRow}
                          className={`w-full py-2 border-2 border-dashed ${c.border} rounded-lg text-xs ${c.text} font-semibold hover:opacity-70 transition-all`}
                        >
                          + Thêm dòng
                        </button>
                      </>
                    ) : (
                      plan.pricing.map((item, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 bg-gray-50 border ${c.border} rounded-xl`}>
                          <span className="text-xs font-semibold text-gray-700">{item.loaiXe}</span>
                          <span className={`text-xs font-bold ${c.text}`}>{item.gia}</span>
                        </div>
                      ))
                    )}
                  </div>
                  {!isEditing && (
                    <p className="text-[10px] text-gray-400 mt-2 italic">
                      * Click &quot;Chỉnh sửa&quot; để cập nhật bảng phí hiển thị
                    </p>
                  )}
                </div>

                {/* Coverage */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FiShield className={`h-4 w-4 ${c.text}`} />
                    <h4 className="font-bold text-gray-900 text-sm">Phạm Vi Bảo Hiểm</h4>
                  </div>
                  <div className="space-y-2">
                    {plan.coverage.map((item, idx) => (
                      <div key={idx} className={`flex items-start gap-3 p-3 bg-gray-50 border ${c.border} rounded-xl`}>
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <FiCheck className={`h-2.5 w-2.5 ${c.text}`} />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Info panel */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <FiInfo className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-700 mb-2">Thông Tin Quan Trọng</h3>
            <ul className="text-xs text-red-700 space-y-1.5">
              <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />Bảng phí chỉnh sửa ở đây là <strong>phí hiển thị tham khảo</strong> cho người dùng, lưu trên trình duyệt.</li>
              <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />Phí thực tế khi mua bảo hiểm được tính bởi Smart Contract — thay đổi cần nâng cấp hợp đồng.</li>
              <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />TNDS Bắt buộc là loại bảo hiểm bắt buộc theo quy định pháp luật Việt Nam.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
