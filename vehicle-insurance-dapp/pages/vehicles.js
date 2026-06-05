import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import { contractService } from "../services/contract";
import {
  FiTruck, FiPlus, FiRefreshCw, FiX, FiCheck,
  FiCalendar, FiDollarSign, FiHash,
} from "react-icons/fi";
import toast from "react-hot-toast";

const VEHICLE_TYPES = [
  { value: 0, label: "Xe máy / Mô tô" },
  { value: 1, label: "Ô tô con (dưới 9 chỗ)" },
  { value: 2, label: "Ô tô kinh doanh vận tải" },
  { value: 3, label: "Xe tải / Xe đầu kéo" },
];

const TYPE_COLOR = {
  0: "bg-orange-50 border-orange-200 text-orange-700",
  1: "bg-blue-50 border-blue-200 text-blue-700",
  2: "bg-purple-50 border-purple-200 text-purple-700",
  3: "bg-gray-50 border-gray-200 text-gray-700",
};

const currentYear = new Date().getFullYear();

export default function Vehicles() {
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    bienSo: "",
    loaiXe: 1,
    namSanXuat: currentYear,
    giaTriXe: "",
  });

  useEffect(() => {
    if (isConnected && provider && address) loadVehicles();
  }, [isConnected, provider, address]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const list = await contractService.getUserVehicles(address, provider);
      setVehicles(list);
    } catch {
      toast.error("Không thể tải danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bienSo.trim()) return toast.error("Vui lòng nhập biển số xe");
    if (!form.giaTriXe || Number(form.giaTriXe) <= 0) return toast.error("Vui lòng nhập giá trị xe hợp lệ");

    setSubmitting(true);
    try {
      const result = await contractService.dangKyXe(
        form.bienSo.trim().toUpperCase(),
        Number(form.loaiXe),
        Number(form.namSanXuat),
        form.giaTriXe,
        "",
        signer
      );
      if (result.success) {
        setForm({ bienSo: "", loaiXe: 1, namSanXuat: currentYear, giaTriXe: "" });
        setShowForm(false);
        await loadVehicles();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4">
              <FiTruck className="h-10 w-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Kết nối ví để tiếp tục</h3>
            <p className="text-gray-500 text-sm">Bạn cần kết nối ví MetaMask để quản lý xe.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Phương Tiện</h1>
            <p className="mt-1 text-gray-500 text-sm">Đăng ký và quản lý xe của bạn trên blockchain</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadVehicles}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Làm mới
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-md text-sm transition-all"
            >
              <FiPlus size={16} />
              Đăng Ký Xe Mới
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {VEHICLE_TYPES.map((type) => {
            const count = vehicles.filter(v => Number(v.loaiXe) === type.value).length;
            return (
              <div key={type.value} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 font-medium mb-1">{type.label}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Form đăng ký xe */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Đăng Ký Xe Mới</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Biển số */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Biển số xe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiHash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.bienSo}
                    onChange={e => setForm(f => ({ ...f, bienSo: e.target.value }))}
                    placeholder="VD: 29A-12345"
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors uppercase"
                  />
                </div>
              </div>

              {/* Loại xe */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Loại xe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiTruck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={form.loaiXe}
                    onChange={e => setForm(f => ({ ...f, loaiXe: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white appearance-none"
                  >
                    {VEHICLE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Năm sản xuất */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Năm sản xuất <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiCalendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={form.namSanXuat}
                    onChange={e => setForm(f => ({ ...f, namSanXuat: e.target.value }))}
                    min="1990"
                    max={currentYear}
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
              </div>

              {/* Giá trị xe */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Giá trị xe (ETH) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiDollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={form.giaTriXe}
                    onChange={e => setForm(f => ({ ...f, giaTriXe: e.target.value }))}
                    placeholder="VD: 0.5"
                    step="0.001"
                    min="0.001"
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-md text-sm transition-all disabled:opacity-50"
                >
                  {submitting
                    ? <><FiRefreshCw size={14} className="animate-spin" /> Đang xử lý...</>
                    : <><FiCheck size={14} /> Đăng Ký Xe</>
                  }
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-xl text-sm transition-all"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danh sách xe */}
        {loading ? (
          <div className="text-center py-16 text-gray-300">
            <FiRefreshCw size={28} className="animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Đang tải danh sách xe...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4">
              <FiTruck className="h-10 w-10 text-orange-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có xe nào</h3>
            <p className="text-gray-500 text-sm mb-6">Đăng ký xe để có thể mua bảo hiểm trên blockchain.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-md text-sm transition-all hover:from-orange-600 hover:to-amber-600"
            >
              <FiPlus size={16} />
              Đăng Ký Xe Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((vehicle) => (
              <div key={vehicle.bienSo} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                {/* Type badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border mb-3 ${TYPE_COLOR[vehicle.loaiXe] || TYPE_COLOR[3]}`}>
                  <FiTruck size={11} />
                  {vehicle.loaiXeLabel}
                </div>

                {/* Biển số */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-mono tracking-wide">
                  {vehicle.bienSo}
                </h3>

                {/* Info */}
                <div className="space-y-1.5 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Năm sản xuất</span>
                    <span className="font-medium text-gray-700">{vehicle.namSanXuat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giá trị xe</span>
                    <span className="font-medium text-gray-700">{parseFloat(vehicle.giaTriXe).toFixed(3)} ETH</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Đã đăng ký
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {vehicle.chuSoHuu?.slice(0, 6)}...{vehicle.chuSoHuu?.slice(-4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
