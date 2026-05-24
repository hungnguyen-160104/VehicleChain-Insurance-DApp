import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiMenu, FiBell, FiGlobe, FiShield, FiZap } from "react-icons/fi";
import { NETWORK_NAME } from "../../config/network";
import LanguageSwitcher from "../Common/LanguageSwitcher";

const Header = ({ setSidebarOpen }) => {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/8 px-4 sm:gap-x-6 sm:px-6 lg:px-8"
      style={{
        background: "rgba(10, 0, 0, 0.75)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        boxShadow: "0 1px 40px rgba(200,16,46,0.08), inset 0 -1px 0 rgba(255,255,255,0.05)"
      }}
    >
      {/* Subtle top accent line — HUST crimson */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent"></div>

      {/* Mobile menu button */}
      <button
        type="button"
        className="relative -m-2.5 p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 lg:hidden group"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <FiMenu className="h-6 w-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-white/10 lg:hidden" aria-hidden="true" />

      <div className="relative flex flex-1 items-center justify-between">
        {/* Left: Network & Status */}
        <div className="flex items-center space-x-3">
          {/* Network status — glass pill */}
          <div className="relative flex items-center space-x-2 rounded-full px-4 py-1.5 border border-emerald-500/25"
            style={{ background: "rgba(16,185,129,0.08)", backdropFilter: "blur(12px)" }}
          >
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div>
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-400 animate-ping opacity-60"></div>
            </div>
            <FiGlobe className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300 tracking-wide">{NETWORK_NAME}</span>
          </div>

          {/* Secondary indicators */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-white/10"
              style={{ background: "rgba(200,16,46,0.12)", backdropFilter: "blur(8px)" }}
            >
              <FiZap className="h-3 w-3 text-red-400" />
              <span className="text-xs font-medium text-red-300">Gas: 15</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-white/10"
              style={{ background: "rgba(139,92,246,0.12)", backdropFilter: "blur(8px)" }}
            >
              <FiShield className="h-3 w-3 text-purple-400" />
              <span className="text-xs font-medium text-purple-300">Secure</span>
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
            className="relative group rounded-xl p-2.5 text-white/60 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20 hover:bg-white/8"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <span className="sr-only">View notifications</span>
            <FiBell className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-[10px] text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/40 animate-pulse">
              3
            </span>
          </button>

          {/* Wallet connect */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-700 to-rose-600 rounded-xl blur opacity-30 hover:opacity-60 transition duration-200"></div>
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

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-700/30 to-transparent"></div>
    </div>
  );
};

export default Header;
