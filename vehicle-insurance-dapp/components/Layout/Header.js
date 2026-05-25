import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiMenu, FiBell, FiGlobe, FiShield, FiZap } from "react-icons/fi";
import { NETWORK_NAME } from "../../config/network";
import LanguageSwitcher from "../Common/LanguageSwitcher";

const Header = ({ setSidebarOpen }) => {
  return (
    <div
      className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-white border-b border-gray-100 px-4 sm:gap-x-6 sm:px-6 lg:px-8"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)" }}
    >
      {/* Top HUST red accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500"></div>

      {/* Mobile menu button */}
      <button
        type="button"
        className="relative -m-2.5 p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-150 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <FiMenu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="relative flex flex-1 items-center justify-between">
        {/* Left: Network & Status */}
        <div className="flex items-center space-x-3">
          {/* Network status pill */}
          <div className="flex items-center space-x-2 rounded-full px-3 py-1.5 bg-emerald-50 border border-emerald-100">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-50"></div>
            </div>
            <FiGlobe className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 tracking-wide">{NETWORK_NAME}</span>
          </div>

          {/* Secondary indicators */}
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

        {/* Right: Language + Notifications + Wallet */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <LanguageSwitcher variant="header" />

          {/* Notifications */}
          <button
            type="button"
            className="relative group rounded-xl p-2.5 text-gray-500 hover:text-gray-700 transition-all duration-150 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          >
            <span className="sr-only">View notifications</span>
            <FiBell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-[10px] text-white flex items-center justify-center font-bold shadow-sm">
              3
            </span>
          </button>

          {/* Wallet connect */}
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
