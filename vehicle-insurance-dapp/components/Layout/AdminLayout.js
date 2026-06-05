import Link from "next/link";
import Image from "next/image";
import { useAccount } from "wagmi";
import {
  FiActivity, FiFileText, FiTruck, FiList, FiCpu,
  FiSettings, FiArrowLeft, FiRefreshCw, FiShield,
} from "react-icons/fi";

const NAV_ITEMS = [
  { id: "overview",      label: "Tổng quan",              icon: FiActivity,  ownerOnly: false },
  { id: "claims",        label: "Yêu Cầu Bồi Thường",    icon: FiFileText,  ownerOnly: false },
  { id: "garages",       label: "Quản Lý Garage",         icon: FiTruck,     ownerOnly: true  },
  { id: "plans",         label: "Gói Bảo Hiểm",           icon: FiList,      ownerOnly: true  },
  { id: "ai-documents",  label: "Tài Liệu AI",            icon: FiCpu,       ownerOnly: true  },
  { id: "controls",      label: "Cài Đặt Hệ Thống",      icon: FiSettings,  ownerOnly: true  },
];

export default function AdminLayout({
  children,
  activeTab,
  onTabChange,
  isOwner,
  loading,
  onRefresh,
}) {
  const { address } = useAccount();
  const visibleNav = NAV_ITEMS.filter(item => !item.ownerOnly || isOwner);
  const currentLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label ?? "Quản Trị";

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-64 bg-gray-900 flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
            <Image src="/logo.png" alt="VehicleChain" width={40} height={40} className="w-full h-full object-cover" unoptimized />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">VehicleChain</p>
            <p className="text-red-400 text-[11px] font-bold tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        {/* Role + address */}
        <div className="px-4 py-3 border-b border-gray-800 space-y-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold
            ${isOwner
              ? "bg-red-900/40 border border-red-800/60 text-red-300"
              : "bg-emerald-900/40 border border-emerald-800/60 text-emerald-300"
            }`}
          >
            {isOwner ? <FiShield size={13} /> : <FiTruck size={13} />}
            {isOwner ? "Chủ Hợp Đồng" : "Garage Ủy Quyền"}
          </div>
          {address && (
            <p className="text-gray-600 text-[10px] font-mono px-1 truncate">
              {address.slice(0, 10)}...{address.slice(-8)}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left
                  ${active
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
              >
                <item.icon size={15} className="flex-shrink-0" />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="px-3 py-4 border-t border-gray-800 space-y-1">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl text-sm transition-colors disabled:opacity-40"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Làm mới dữ liệu
          </button>
          <Link href="/dashboard">
            <div className="flex items-center gap-2.5 px-3 py-2 text-gray-600 hover:text-gray-300 hover:bg-gray-800 rounded-xl text-sm transition-colors cursor-pointer">
              <FiArrowLeft size={13} />
              Về trang người dùng
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-base font-bold text-gray-900">{currentLabel}</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">VehicleChain · Admin Panel</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400 font-mono">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "—"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
