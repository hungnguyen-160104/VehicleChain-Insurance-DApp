import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { VehicleInsuranceABI } from "../contracts/VehicleInsuranceABI";
import { CONTRACT_ADDRESS } from "../config/network";
import { INSURANCE_TYPE_LABELS, CLAIM_STATUS_LABELS } from "../services/contract";

const RPC_URL = process.env.NEXT_PUBLIC_LOCALHOST_RPC || "http://127.0.0.1:8545";
const MAX_NOTIFS = 30;

function storageKey(address) {
  return `vc_notifs_${address?.toLowerCase()}`;
}

function loadStored(address) {
  if (typeof window === "undefined" || !address) return [];
  try {
    const raw = localStorage.getItem(storageKey(address));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(address, list) {
  if (typeof window === "undefined" || !address) return;
  try {
    localStorage.setItem(storageKey(address), JSON.stringify(list.slice(0, MAX_NOTIFS)));
  } catch {}
}

function fmtEth(wei) {
  return parseFloat(ethers.utils.formatEther(wei)).toFixed(4);
}

export function useNotifications() {
  const { address, isConnected } = useAccount();
  const [notifications, setNotifications] = useState([]);

  // Load từ localStorage khi đổi ví
  useEffect(() => {
    setNotifications(loadStored(address));
  }, [address]);

  const push = useCallback((notif) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      ...notif,
    };
    setNotifications(prev => {
      const next = [item, ...prev].slice(0, MAX_NOTIFS);
      persist(address, next);
      return next;
    });
  }, [address]);

  // Lắng nghe contract events từ blockchain
  useEffect(() => {
    if (!isConnected || !address || !CONTRACT_ADDRESS) return;

    let provider;
    let contract;
    try {
      provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      contract = new ethers.Contract(CONTRACT_ADDRESS, VehicleInsuranceABI, provider);
    } catch {
      return;
    }

    const me = address.toLowerCase();

    // ── Mua bảo hiểm ──────────────────────────────────────
    const onMua = (policyId, policyholder, bienSo, insuranceType, premium) => {
      if (policyholder.toLowerCase() !== me) return;
      push({
        type: "success",
        title: "Mua bảo hiểm thành công",
        message: `HĐ #${policyId} — ${bienSo} (${INSURANCE_TYPE_LABELS[insuranceType] ?? insuranceType}), phí ${fmtEth(premium)} ETH`,
      });
    };

    // ── Hủy hợp đồng ──────────────────────────────────────
    const onHuy = (policyId, policyholder) => {
      if (policyholder.toLowerCase() !== me) return;
      push({
        type: "warning",
        title: "Hợp đồng đã hủy",
        message: `Hợp đồng bảo hiểm #${policyId} của bạn đã bị hủy.`,
      });
    };

    // ── Nộp yêu cầu bồi thường ────────────────────────────
    const onYeuCau = (claimId, policyId, claimant, claimAmount) => {
      if (claimant.toLowerCase() !== me) return;
      push({
        type: "info",
        title: "Yêu cầu bồi thường đã gửi",
        message: `Yêu cầu #${claimId} (HĐ #${policyId}), ${fmtEth(claimAmount)} ETH — đang chờ xử lý.`,
      });
    };

    // ── Đã chi trả bồi thường (recipient không indexed → lọc thủ công) ──
    const onChiTra = (claimId, amount, recipient) => {
      if (recipient.toLowerCase() !== me) return;
      push({
        type: "success",
        title: "Đã nhận tiền bồi thường",
        message: `Yêu cầu #${claimId} đã được chi trả ${fmtEth(amount)} ETH vào ví của bạn.`,
      });
    };

    // ── Gia hạn bảo hiểm ──────────────────────────────────
    const onGiaHan = (policyId, policyholder, amount) => {
      if (policyholder.toLowerCase() !== me) return;
      push({
        type: "info",
        title: "Gia hạn bảo hiểm thành công",
        message: `HĐ #${policyId} đã gia hạn thêm 1 tháng, phí ${fmtEth(amount)} ETH.`,
      });
    };

    // ── Đăng ký xe ────────────────────────────────────────
    // Lưu ý: `bienSo` là `string indexed` trong event → ethers v5 trả về
    // object hash (không phải biển số gốc), nên message không dùng giá trị này.
    const onDangKy = (bienSo, chuSoHuu, loaiXe) => {
      if (chuSoHuu.toLowerCase() !== me) return;
      push({
        type: "success",
        title: "Đăng ký xe thành công",
        message: `Xe của bạn đã được ghi lên blockchain.`,
      });
    };

    // ── Cập nhật trạng thái yêu cầu (chỉ hiện cho chủ sở hữu) ──
    // Lưu claimId của user từ YeuCauDaNop, rồi match ở đây
    const userClaimIds = new Set();
    const onYeuCauForTracking = (claimId, policyId, claimant) => {
      if (claimant.toLowerCase() === me) userClaimIds.add(claimId.toString());
    };
    const onTrangThai = (claimId, newStatus) => {
      if (!userClaimIds.has(claimId.toString())) return;
      const status = Number(newStatus);
      push({
        type: status === 4 ? "success" : status === 5 ? "error" : "info",
        title: "Trạng thái yêu cầu được cập nhật",
        message: `Yêu cầu #${claimId}: ${CLAIM_STATUS_LABELS[status] ?? `Trạng thái ${status}`}`,
      });
    };

    contract.on("HopDongDaMua", onMua);
    contract.on("HopDongDaHuy", onHuy);
    contract.on("YeuCauDaNop", onYeuCau);
    contract.on("YeuCauDaNop", onYeuCauForTracking);
    contract.on("BoiThuongDaChiTra", onChiTra);
    contract.on("PhiDaGiaHan", onGiaHan);
    contract.on("XeDaDangKy", onDangKy);
    contract.on("TrangThaiCapNhat", onTrangThai);

    return () => {
      contract.removeAllListeners();
      try { provider.removeAllListeners(); } catch {}
    };
  }, [isConnected, address, push]);

  const markRead = useCallback((id) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      persist(address, next);
      return next;
    });
  }, [address]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      persist(address, next);
      return next;
    });
  }, [address]);

  const dismiss = useCallback((id) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      persist(address, next);
      return next;
    });
  }, [address]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    if (typeof window !== "undefined" && address) {
      localStorage.removeItem(storageKey(address));
    }
  }, [address]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
  };
}
