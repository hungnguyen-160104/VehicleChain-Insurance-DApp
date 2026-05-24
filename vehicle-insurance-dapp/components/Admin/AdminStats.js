import { useState } from "react";
import {
  FiRefreshCw,
  FiFileText,
  FiDollarSign,
  FiShield,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiZap,
  FiSettings,
  FiTruck,
  FiClock,
  FiDownload,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { CLAIM_STATUS, CLAIM_STATUS_LABELS, INSURANCE_TYPE_LABELS } from "../../services/contract";

// ─── Export PDF helper ─────────────────────────────────────────────────────
const exportAdminReport = async (adminData) => {
  // Dynamic import để tránh lỗi SSR với Next.js static export
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const contractStats = adminData?.contractStats || {};
  const pendingClaims = adminData?.pendingClaims || [];
  const contractBalance = adminData?.contractBalance || "0";

  // ── Tiêu đề ──
  doc.setFillColor(200, 16, 46); // HUST Red #C8102E
  doc.rect(0, 0, pageW, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("VEHICLECHAIN INSURANCE DAPP", pageW / 2, 14, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("BAO CAO QUAN TRI HE THONG", pageW / 2, 22, { align: "center" });

  doc.setFontSize(9);
  doc.text(`Ngay xuat: ${dateStr}`, pageW / 2, 30, { align: "center" });

  // ── Thông tin tổng quan ──
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("1. TONG QUAN HE THONG", 14, 50);

  const summaryData = [
    ["So du hop dong (ETH)", `${parseFloat(contractBalance).toFixed(4)} ETH`],
    ["Tong hop dong bao hiem", String(contractStats.totalPolicies || 0)],
    ["Tong yeu cau boi thuong", String(contractStats.totalClaims || 0)],
    ["Yeu cau dang cho xu ly", String(
      pendingClaims.filter(
        (c) => c.status === CLAIM_STATUS.PENDING ||
               c.status === CLAIM_STATUS.DANG_GIAM_DINH ||
               c.status === CLAIM_STATUS.CHO_HO_SO ||
               c.status === CLAIM_STATUS.DANG_THAM_DINH
      ).length
    )],
    ["Yeu cau da duyet", String(pendingClaims.filter((c) => c.status === CLAIM_STATUS.APPROVED).length)],
    ["Yeu cau da chi tra", String(pendingClaims.filter((c) => c.status === CLAIM_STATUS.PAID).length)],
    ["Yeu cau bi tu choi", String(pendingClaims.filter((c) => c.status === CLAIM_STATUS.REJECTED).length)],
  ];

  autoTable(doc, {
    startY: 55,
    head: [["Chi so", "Gia tri"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [200, 16, 46], textColor: 255, fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [252, 235, 235] },
    columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 60, fontStyle: "bold" } },
    margin: { left: 14, right: 14 },
  });

  // ── Tài chính ──
  const totalClaimAmount = pendingClaims.reduce(
    (sum, c) => sum + parseFloat(c.claimAmount || 0), 0
  );
  const totalApproved = pendingClaims.reduce(
    (sum, c) =>
      (c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID)
        ? sum + parseFloat(c.approvedAmount || 0)
        : sum,
    0
  );
  const approvalRate = pendingClaims.length > 0
    ? (pendingClaims.filter((c) => c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID).length / pendingClaims.length * 100).toFixed(1)
    : "0.0";

  const afterSummary = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("2. PHAN TICH TAI CHINH", 14, afterSummary);

  autoTable(doc, {
    startY: afterSummary + 5,
    head: [["Chi tieu tai chinh", "Gia tri"]],
    body: [
      ["Tong so tien yeu cau boi thuong", `${totalClaimAmount.toFixed(4)} ETH`],
      ["Tong so tien da chi tra / duyet", `${totalApproved.toFixed(4)} ETH`],
      ["Ty le duyet yeu cau (Approval Rate)", `${approvalRate}%`],
      ["Loss Ratio (chi tra / so du)", parseFloat(contractBalance) > 0
        ? `${(totalApproved / parseFloat(contractBalance) * 100).toFixed(1)}%`
        : "N/A"],
    ],
    theme: "grid",
    headStyles: { fillColor: [200, 16, 46], textColor: 255, fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [252, 235, 235] },
    columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 60, fontStyle: "bold" } },
    margin: { left: 14, right: 14 },
  });

  // ── Danh sách claims ──
  if (pendingClaims.length > 0) {
    doc.addPage();

    doc.setFillColor(200, 16, 46);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("3. DANH SACH YEU CAU BOI THUONG", pageW / 2, 11, { align: "center" });

    const claimRows = pendingClaims.slice(0, 50).map((c) => [
      `#${c.claimId}`,
      c.vehicleBienSo || "N/A",
      INSURANCE_TYPE_LABELS[c.insuranceType] || "N/A",
      `${parseFloat(c.claimAmount || 0).toFixed(4)}`,
      `${parseFloat(c.approvedAmount || 0).toFixed(4)}`,
      CLAIM_STATUS_LABELS[c.status] || "N/A",
      c.submissionDate ? new Date(c.submissionDate).toLocaleDateString("vi-VN") : "N/A",
    ]);

    autoTable(doc, {
      startY: 24,
      head: [["Claim ID", "Bien so", "Loai BH", "YC (ETH)", "DT (ETH)", "Trang thai", "Ngay nop"]],
      body: claimRows,
      theme: "striped",
      headStyles: { fillColor: [200, 16, 46], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [252, 235, 235] },
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 24 },
        2: { cellWidth: 36 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
        6: { cellWidth: 22 },
      },
      margin: { left: 10, right: 10 },
    });

    if (pendingClaims.length > 50) {
      const finalY = doc.lastAutoTable.finalY + 5;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`... va ${pendingClaims.length - 50} yeu cau khac (hien thi 50/tong ${pendingClaims.length})`, 10, finalY);
    }
  }

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(
      `VehicleChain Insurance DApp  |  Trang ${i}/${pageCount}  |  ${dateStr}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  // ── Lưu file ──
  const fileName = `BaoCaoAdmin_${now.toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
  return fileName;
};

// ─── Main Component ────────────────────────────────────────────────────────
const AdminStats = ({ adminData, loading, onRefresh }) => {
  const contractStats = adminData?.contractStats || {};
  const pendingClaims = adminData?.pendingClaims || [];
  const contractBalance = adminData?.contractBalance || "0";
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const fileName = await exportAdminReport(adminData);
      toast.success(`Đã xuất: ${fileName}`);
    } catch (err) {
      console.error("Export PDF error:", err);
      toast.error("Lỗi khi xuất PDF. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  const stats = [
    {
      name: "Số Dư Hợp Đồng",
      value: loading ? "..." : `${parseFloat(contractBalance || 0).toFixed(4)} ETH`,
      description: "Tổng ETH trong hợp đồng",
      icon: FiDollarSign,
      color: "green",
      change: "Quỹ bảo hiểm",
      changeType: "neutral",
    },
    {
      name: "Tổng Hợp Đồng",
      value: loading ? "..." : String(contractStats.totalPolicies || "0"),
      description: "Hợp đồng bảo hiểm đã tạo",
      icon: FiShield,
      color: "blue",
      change: "Tất cả thời gian",
      changeType: "neutral",
    },
    {
      name: "Tổng Yêu Cầu",
      value: loading ? "..." : String(contractStats.totalClaims || "0"),
      description: "Yêu cầu bồi thường đã nộp",
      icon: FiFileText,
      color: "purple",
      change: "Tất cả thời gian",
      changeType: "neutral",
    },
    {
      name: "Chờ Xử Lý",
      value: loading ? "..." : String(
        pendingClaims.filter(
          (c) =>
            c.status === CLAIM_STATUS.PENDING ||
            c.status === CLAIM_STATUS.DANG_GIAM_DINH ||
            c.status === CLAIM_STATUS.CHO_HO_SO ||
            c.status === CLAIM_STATUS.DANG_THAM_DINH
        ).length || "0"
      ),
      description: "Yêu cầu cần xem xét",
      icon: FiClock,
      color: "yellow",
      change: "Cần xử lý",
      changeType:
        pendingClaims.filter(
          (c) =>
            c.status === CLAIM_STATUS.PENDING ||
            c.status === CLAIM_STATUS.DANG_GIAM_DINH ||
            c.status === CLAIM_STATUS.CHO_HO_SO ||
            c.status === CLAIM_STATUS.DANG_THAM_DINH
        ).length > 0
          ? "negative"
          : "neutral",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: { bg: "from-emerald-100 to-green-100", text: "text-emerald-400", border: "border-emerald-500/25", glow: "from-emerald-500/10 to-green-500/10" },
      blue: { bg: "from-red-900/40 to-orange-900/30", text: "text-red-400", border: "border-red-200", glow: "from-red-600/10 to-orange-500/10" },
      purple: { bg: "from-purple-100 to-pink-100", text: "text-purple-400", border: "border-purple-200", glow: "from-purple-500/10 to-pink-500/10" },
      indigo: { bg: "from-red-100 to-purple-100", text: "text-red-400", border: "border-red-200", glow: "from-red-500/10 to-purple-500/10" },
      yellow: { bg: "from-yellow-100 to-orange-100", text: "text-yellow-400", border: "border-yellow-200", glow: "from-yellow-500/10 to-orange-500/10" },
      red: { bg: "from-red-100 to-pink-100", text: "text-red-400", border: "border-red-200", glow: "from-red-500/10 to-pink-500/10" },
    };
    return colors[color] || colors.indigo;
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case "positive": return FiArrowUp;
      case "negative": return FiArrowDown;
      default: return FiMinus;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-white/10 to-white/15 rounded-xl w-64 mb-2"></div>
            <div className="h-4 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-48"></div>
          </div>
          <div className="h-10 bg-gradient-to-r from-white/10 to-white/15 rounded-xl w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-6 overflow-hidden">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-white/10 to-white/15 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-2 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-8 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-2/3"></div>
                  <div className="h-4 bg-gradient-to-r from-white/10 to-white/15 rounded-lg w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Tính tỷ lệ thực tế
  const totalClaimsCount = pendingClaims.length;
  const approvedCount = pendingClaims.filter(
    (c) => c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID
  ).length;
  const rejectedCount = pendingClaims.filter((c) => c.status === CLAIM_STATUS.REJECTED).length;
  const approvalRate = totalClaimsCount > 0 ? ((approvedCount / totalClaimsCount) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Tổng Quan Hệ Thống</h2>
          <p className="text-white/60">Thống kê bảo hiểm xe cơ giới theo thời gian thực</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting || loading}
            className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-700 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            <FiDownload
              className={`-ml-1 mr-2 h-4 w-4 ${isExporting ? "animate-bounce" : "group-hover:scale-110"} transition-transform`}
            />
            {isExporting ? "Đang xuất..." : "Xuất Báo Cáo PDF"}
          </button>

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="group inline-flex items-center px-4 py-2 bg-white/8 backdrop-blur-xl border border-white/12 shadow-lg text-sm font-medium rounded-xl text-white/80 hover:bg-white/15 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              <FiRefreshCw
                className={`-ml-1 mr-2 h-4 w-4 ${loading ? "animate-spin" : "group-hover:scale-110"} transition-transform`}
              />
              Làm Mới
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colorScheme = getColorClasses(stat.color);
          const ChangeIcon = getChangeIcon(stat.changeType);

          return (
            <div
              key={stat.name}
              className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-6 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorScheme.glow} rounded-full blur-xl opacity-50`}></div>
                <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br ${colorScheme.glow} rounded-full blur-lg opacity-30`}></div>
              </div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorScheme.bg} border ${colorScheme.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`h-6 w-6 ${colorScheme.text}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white mb-1">{stat.name}</p>
                      <p className="text-xs font-medium text-white/60">{stat.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                </div>

                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-xl text-sm font-semibold ${
                    stat.changeType === "positive"
                      ? "bg-gradient-to-r from-emerald-900/20 to-green-900/15 text-emerald-400 border border-emerald-500/25"
                      : stat.changeType === "negative"
                      ? "bg-gradient-to-r from-red-900/20 to-pink-900/15 text-red-300 border border-red-500/20"
                      : "bg-gradient-to-r from-gray-50 to-white/8 text-white/80 border border-white/12"
                  }`}
                >
                  <ChangeIcon className={`h-3 w-3 ${stat.changeType === "positive" ? "text-emerald-400" : stat.changeType === "negative" ? "text-red-400" : "text-white/60"}`} />
                  <span>{stat.change}</span>
                </div>

                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorScheme.glow} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract Health */}
        <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-8">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          </div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <FiZap className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Trạng Thái Contract</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Trạng thái hợp đồng", value: "Đang hoạt động", type: "success" },
                { label: "Chế độ tạm dừng", value: "Đang chạy", type: "success" },
                { label: "Loại bảo hiểm", value: "4 loại xe", type: "info" },
                { label: "Blockchain", value: "Ethereum", type: "info" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/60">{item.label}</span>
                  {item.type === "success" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-900/20 to-green-900/15 text-emerald-400 border border-emerald-500/25">
                      <FiCheckCircle className="w-3 h-3 mr-1" /> {item.value}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Claim Approval Rate */}
        <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-8">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          </div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <FiActivity className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Tỷ Lệ Xử Lý</h3>
            </div>

            {/* Approval rate circle */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#a855f7" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40 * parseFloat(approvalRate) / 100} ${2 * Math.PI * 40}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{approvalRate}%</span>
                  <span className="text-xs text-white/50">duyệt</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-emerald-900/20 border border-emerald-500/25 rounded-xl">
                <div className="text-xl font-bold text-emerald-400">{approvedCount}</div>
                <div className="text-xs text-white/50">Đã duyệt</div>
              </div>
              <div className="text-center p-3 bg-red-900/20 border border-red-500/20 rounded-xl">
                <div className="text-xl font-bold text-red-400">{rejectedCount}</div>
                <div className="text-xs text-white/50">Từ chối</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative bg-white/8 backdrop-blur-xl border border-white/12 shadow-xl rounded-2xl p-8">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl"></div>
          </div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-purple-100 flex items-center justify-center">
                <FiSettings className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Thao Tác Nhanh</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: FiTruck, label: "Quản Lý Garage", color: "from-red-600 to-purple-600" },
                { icon: FiFileText, label: "Xem Yêu Cầu", color: "from-emerald-600 to-green-600" },
                { icon: FiDollarSign, label: "Rút Tiền", color: "from-purple-600 to-pink-600" },
                { icon: FiDownload, label: "Xuất PDF", color: "from-orange-600 to-red-600" },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={index === 3 ? handleExportPDF : undefined}
                  disabled={index === 3 && isExporting}
                  className={`group relative inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r ${action.color} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-50`}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <action.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
