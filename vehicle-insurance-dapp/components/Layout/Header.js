import { useState, useRef, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  FiMenu, FiBell, FiGlobe, FiShield, FiZap,
  FiCheck, FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiDollarSign, FiFileText, FiRefreshCw,
} from "react-icons/fi";
import { NETWORK_NAME } from "../../config/network";
import LanguageSwitcher from "../Common/LanguageSwitcher";
import { useNotifications } from "../../hooks/useNotifications";

const TYPE_STYLE = {
  success: { bg: "bg-emerald-50", iconColor: "text-emerald-600", border: "border-emerald-100", dot: "bg-emerald-500", Icon: FiCheckCircle },
  info:    { bg: "bg-blue-50",    iconColor: "text-blue-600",    border: "border-blue-100",    dot: "bg-blue-500",    Icon: FiInfo },
  warning: { bg: "bg-amber-50",   iconColor: "text-amber-600",   border: "border-amber-100",   dot: "bg-amber-500",   Icon: FiAlertCircle },
  error:   { bg: "bg-red-50",     iconColor: "text-red-600",     border: "border-red-100",     dot: "bg-red-500",     Icon: FiAlertCircle },
};

const Header = ({ setSidebarOpen }) => {
  const { isConnected } = useAccount();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll } = useNotifications();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-white border-b border-gray-100 px-4 sm:gap-x-6 sm:px-6 lg:px-8"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />

      {/* Mobile menu */}
      <button
        type="button"
        className="relative -m-2.5 p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-150 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <FiMenu className="h-6 w-6" />
      </button>
      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      <div className="relative flex flex-1 items-center justify-between">
        {/* Left */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 rounded-full px-3 py-1.5 bg-emerald-50 border border-emerald-100">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-50" />
            </div>
            <FiGlobe className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 tracking-wide">{NETWORK_NAME}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-100">
              <FiZap className="h-3 w-3 text-red-500" />
              <span className="text-xs font-medium text-red-600">Gas: 15</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100">
              <FiShield className="h-3 w-3 text-purple-500" />
              <span className="text-xs font-medium text-purple-600">Secure</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-3">
          <LanguageSwitcher variant="header" />

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifs(v => !v)}
              className="relative group rounded-xl p-2.5 text-gray-500 hover:text-gray-700 transition-all duration-150 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-[10px] text-white flex items-center justify-center font-bold shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">Thông báo</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      <FiCheck size={12} /> Đọc tất cả
                    </button>
                  )}
                </div>

                {/* Không có ví — hướng dẫn */}
                {!isConnected && (
                  <div className="px-4 py-6 text-center">
                    <FiBell className="mx-auto mb-2 text-gray-300" size={28} />
                    <p className="text-sm text-gray-500">Kết nối ví để nhận thông báo từ blockchain.</p>
                  </div>
                )}

                {/* Có ví nhưng chưa có thông báo */}
                {isConnected && notifications.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <FiBell className="mx-auto mb-2 text-gray-300" size={28} />
                    <p className="text-sm text-gray-500">Chưa có thông báo nào.</p>
                    <p className="text-xs text-gray-400 mt-1">Thông báo xuất hiện khi bạn mua bảo hiểm, nộp yêu cầu bồi thường, v.v.</p>
                  </div>
                )}

                {/* Danh sách thông báo */}
                {isConnected && notifications.length > 0 && (
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifications.map(notif => {
                      const style = TYPE_STYLE[notif.type] ?? TYPE_STYLE.info;
                      const { Icon } = style;
                      return (
                        <div
                          key={notif.id}
                          onClick={() => markRead(notif.id)}
                          className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${notif.read ? "opacity-60" : ""}`}
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center mt-0.5`}>
                            <Icon size={14} className={style.iconColor} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-gray-900 leading-tight">{notif.title}</p>
                              <button
                                onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                                className="flex-shrink-0 text-gray-300 hover:text-gray-500 mt-0.5"
                              >
                                <FiX size={12} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {!notif.read && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
                              <span className="text-[10px] text-gray-400">{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                {isConnected && notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
                    <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      Xóa tất cả thông báo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wallet */}
          <div className="relative">
            <ConnectButton
              chainStatus="icon"
              accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
              showBalance={{ smallScreen: false, largeScreen: true }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
