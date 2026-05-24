import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "../i18n";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import i18n from "../i18n";

import { config } from "../config/network";

const client = new QueryClient();

export default function App({ Component, pageProps }) {
  // Áp dụng ngôn ngữ đã lưu SAU KHI hydration hoàn tất.
  // Không đọc localStorage lúc khởi tạo i18n (tránh hydration mismatch):
  // SSR luôn render "vi", client sau đó switch sang ngôn ngữ người dùng đã chọn.
  useEffect(() => {
    const savedLang = localStorage.getItem("vehiclechain_lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
