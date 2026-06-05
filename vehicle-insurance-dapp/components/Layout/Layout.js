import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "react-hot-toast";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Subtle background decorations — light version */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Very subtle HUST red tint in corners */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-50 rounded-full blur-[160px] opacity-70"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-50 rounded-full blur-[120px] opacity-50"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(200,16,46,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(200,16,46,0.015)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {/* Enhanced Toaster — light theme */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#1E293B",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            duration: 3000,
            style: {
              background: "#F0FDF4",
              color: "#166534",
              border: "1px solid #BBF7D0",
              boxShadow: "0 10px 40px rgba(22,163,74,0.1), 0 2px 8px rgba(0,0,0,0.06)",
            },
            iconTheme: { primary: "#16a34a", secondary: "#ffffff" },
          },
          error: {
            duration: 4000,
            style: {
              background: "#FFF1F2",
              color: "#9f1239",
              border: "1px solid #FECDD3",
              boxShadow: "0 10px 40px rgba(200,16,46,0.1), 0 2px 8px rgba(0,0,0,0.06)",
            },
            iconTheme: { primary: "#C8102E", secondary: "#ffffff" },
          },
          loading: {
            style: {
              background: "#FFF7ED",
              color: "#9A3412",
              border: "1px solid #FED7AA",
            },
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content area */}
      <div className="lg:pl-72 relative">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="relative py-8">
          <div className="px-4 sm:px-6 lg:px-8 relative">
            <div className="relative z-10">{children}</div>
          </div>

          {/* Floating blockchain status badge */}
          <div className="fixed bottom-24 right-6 z-30">
            <div className="group relative">
              <div className="relative bg-white rounded-full p-3 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              </div>
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                Blockchain Connected
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Global overrides */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #CBD5E1, #94A3B8); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #C8102E, #E11D48); }

        [data-rk] {
          --rk-colors-accentColor: #C8102E;
          --rk-colors-accentColorForeground: #ffffff;
          --rk-radii-actionButton: 10px;
          --rk-radii-connectButton: 10px;
          --rk-radii-menuButton: 10px;
          --rk-radii-modal: 20px;
          --rk-radii-modalMobile: 20px;
        }
      `}</style>
    </div>
  );
};

export default Layout;
