import { useAccount, useSwitchChain } from "wagmi";
import { useTranslation } from "react-i18next";
import { config } from "../../config/network";

// Chain duy nhất app hỗ trợ (localhost 1337 — xem config/network.js)
const EXPECTED_CHAIN = config.chains[0];

/**
 * Banner cảnh báo khi ví đang kết nối sai mạng blockchain.
 * Hiển thị cố định trên cùng màn hình kèm nút chuyển mạng nhanh.
 */
export default function NetworkGuard() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const { t } = useTranslation();

  if (!isConnected || chainId === EXPECTED_CHAIN.id) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-red-600 text-white text-sm px-4 py-2 flex flex-wrap items-center justify-center gap-3 shadow-lg">
      <span>
        ⚠️ {t("network.wrongNetwork", { network: EXPECTED_CHAIN.name })}
      </span>
      <button
        onClick={() => switchChain({ chainId: EXPECTED_CHAIN.id })}
        disabled={isPending}
        className="bg-white text-red-600 font-semibold px-3 py-1 rounded-md hover:bg-red-50 disabled:opacity-60"
      >
        {isPending ? t("network.switching") : t("network.switchButton")}
      </button>
    </div>
  );
}
