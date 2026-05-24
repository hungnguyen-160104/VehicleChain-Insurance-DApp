import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "react-hot-toast";
import ChatWidget from "../Chat/ChatWidget";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{background: "linear-gradient(135deg, #0a0000 0%, #1a0000 25%, #2d0000 50%, #1a0010 75%, #0a0005 100%)"}}>
      {/* Deep crimson radial glow — HUST brand core */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary HUST crimson glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/40 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-red-800/30 rounded-full blur-[100px]"></div>

        {/* Secondary accent glows */}
        <div
          className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-red-950/50 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "3s", animationDuration: "8s" }}
        ></div>
        <div
          className="absolute top-2/3 right-1/3 w-48 h-48 bg-rose-900/20 rounded-full blur-[60px] animate-pulse"
          style={{ animationDelay: "6s", animationDuration: "10s" }}
        ></div>

        {/* Fine grid pattern — institutional feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(200,16,46,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(200,16,46,0.04)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Vertical light streams */}
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-red-600/20 to-transparent"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-red-800/15 to-transparent"></div>
      </div>

      {/* Enhanced Toaster with dark glass theme */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(15, 0, 0, 0.85)",
            backdropFilter: "blur(20px)",
            color: "#fff",
            border: "1px solid rgba(200, 16, 46, 0.3)",
            borderRadius: "14px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(200,16,46,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
          },
          success: {
            duration: 3000,
            style: {
              background: "rgba(6, 78, 59, 0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(16, 185, 129, 0.15)",
            },
            iconTheme: { primary: "#10b981", secondary: "#ffffff" },
          },
          error: {
            duration: 4000,
            style: {
              background: "rgba(127, 29, 29, 0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(239,68,68,0.15)",
            },
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
          loading: {
            style: {
              background: "rgba(100, 0, 0, 0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(200, 16, 46, 0.3)",
            },
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content area */}
      <div className="lg:pl-72 relative">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="relative py-10">
          <div className="px-4 sm:px-6 lg:px-8 relative">
            <div className="relative z-10">{children}</div>
          </div>

          {/* Floating blockchain status badge — moved up to make room for Chat FAB */}
          <div className="fixed bottom-24 right-6 z-30">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-full p-3 border border-green-500/30 shadow-2xl">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              </div>
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-xl text-white text-xs px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                Blockchain Connected
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-black/80"></div>
              </div>
            </div>
          </div>

          {/* AI Chat Widget */}
          <ChatWidget />
        </main>
      </div>

      {/* Global overrides */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(200,16,46,0.05); }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #9B1C1C, #7F1D1D); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #C8102E, #991B1B); }

        [data-rk] {
          --rk-colors-accentColor: #C8102E;
          --rk-colors-accentColorForeground: #ffffff;
          --rk-radii-actionButton: 10px;
          --rk-radii-connectButton: 10px;
          --rk-radii-menuButton: 10px;
          --rk-radii-modal: 20px;
          --rk-radii-modalMobile: 20px;
        }

        .backdrop-blur-xl { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .backdrop-blur-2xl { backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); }
        .backdrop-blur-md { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
      `}</style>
    </div>
  );
};

export default Layout;
