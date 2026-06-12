import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "../i18n";

import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import i18n from "../i18n";

import { config } from "../config/network";
import ChatWidget from "../components/Chat/ChatWidget";
import NetworkGuard from "../components/Layout/NetworkGuard";

const client = new QueryClient();

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");

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
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, viewport-fit=cover"
            />
          </Head>
          <NetworkGuard />
          <Component {...pageProps} />
          {!isAdminPage && <ChatWidget />}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
