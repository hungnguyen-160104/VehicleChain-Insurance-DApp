import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS } from "../config/network";
import { VEHICLE_INSURANCE_ABI } from "../contracts/VehicleInsuranceABI";

// ═══════════════════════════════════════════════════════
// CONSTANTS — khớp với enum trong VehicleInsuranceDApp.sol
// ═══════════════════════════════════════════════════════

export const VEHICLE_TYPES = {
  XE_MAY: 0,
  O_TO_CON: 1,
  O_TO_KINH_DOANH: 2,
  XE_TAI: 3,
};

export const VEHICLE_TYPE_LABELS = {
  0: "Xe máy / Mô tô",
  1: "Ô tô con (dưới 9 chỗ)",
  2: "Ô tô kinh doanh vận tải",
  3: "Xe tải / Xe đầu kéo",
};

export const INSURANCE_TYPES = {
  TNDS_BAT_BUOC: 0,
  VAT_CHAT_XE: 1,
  NGUOI_TREN_XE: 2,
  TAI_NAN_LAI_XE: 3,
};

export const INSURANCE_TYPE_LABELS = {
  0: "TNDS Bắt buộc",
  1: "Bảo hiểm Vật chất xe",
  2: "Bảo hiểm Người trên xe",
  3: "Bảo hiểm Tai nạn lái/phụ xe",
};

export const PAYMENT_TYPES = {
  ONE_TIME: 0,
  MONTHLY: 1,
};

export const POLICY_STATUS = {
  ACTIVE: 0,
  EXPIRED: 1,
  CANCELLED: 2,
  SUSPENDED: 3,
};

export const POLICY_STATUS_LABELS = {
  0: "Đang hiệu lực",
  1: "Hết hạn",
  2: "Đã hủy",
  3: "Tạm dừng",
};

export const CLAIM_STATUS = {
  PENDING: 0,
  DANG_GIAM_DINH: 1,
  CHO_HO_SO: 2,
  DANG_THAM_DINH: 3,
  APPROVED: 4,
  REJECTED: 5,
  PAID: 6,
};

export const CLAIM_STATUS_LABELS = {
  0: "Chờ xử lý",
  1: "Đang giám định",
  2: "Chờ hồ sơ",
  3: "Đang thẩm định",
  4: "Đã duyệt",
  5: "Từ chối",
  6: "Đã chi trả",
};

// ═══════════════════════════════════════════════════════
// CONTRACT SERVICE
// ═══════════════════════════════════════════════════════

class ContractService {
  constructor() {
    this.contractAddress = null;
    this.contract = null;
  }

  // ─── Khởi tạo contract ──────────────────────────────
  initContract(signerOrProvider, withSigner = false) {
    try {
      const address = CONTRACT_ADDRESS;
      if (!address) {
        toast.error("Chưa cấu hình địa chỉ contract");
        return null;
      }
      if (!ethers.utils.isAddress(address)) {
        toast.error("Địa chỉ contract không hợp lệ");
        return null;
      }
      this.contractAddress = address;
      this.contract = new ethers.Contract(address, VEHICLE_INSURANCE_ABI, signerOrProvider);
      return this.contract;
    } catch (err) {
      console.error("initContract error:", err);
      toast.error("Không thể kết nối contract");
      return null;
    }
  }

  // ─── Helper: parse lỗi từ contract ──────────────────
  _parseError(err) {
    if (err?.reason) return err.reason;
    if (err?.message?.includes("user rejected")) return "Người dùng từ chối giao dịch";
    if (err?.message?.includes("insufficient funds")) return "Không đủ ETH để thực hiện";
    if (err?.data?.message) return err.data.message;
    return err?.message || "Đã xảy ra lỗi";
  }

  // ═══════════════════════════════════════════════════════
  // XE (VEHICLE)
  // ═══════════════════════════════════════════════════════

  async dangKyXe(bienSo, loaiXe, namSanXuat, giaTriXe, ipfsMetadata, signer) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.dangKyXe(
        bienSo,
        loaiXe,
        namSanXuat,
        ethers.utils.parseEther(giaTriXe.toString()),
        ipfsMetadata,
        { gasLimit: 300000 }
      );
      toast.loading("Đang đăng ký xe...", { id: "dangky" });
      const receipt = await tx.wait();
      toast.success("Đăng ký xe thành công!", { id: "dangky" });
      return { success: true, receipt, txHash: tx.hash };
    } catch (err) {
      console.error("dangKyXe error:", err);
      toast.error(this._parseError(err), { id: "dangky" });
      return { success: false, error: err.message };
    }
  }

  async getVehicle(bienSo, provider) {
    try {
      const contract = this.initContract(provider);
      const v = await contract.getVehicle(bienSo);
      return {
        bienSo: v.bienSo,
        loaiXe: Number(v.loaiXe),
        loaiXeLabel: VEHICLE_TYPE_LABELS[Number(v.loaiXe)] || "Không rõ",
        namSanXuat: Number(v.namSanXuat),
        giaTriXe: ethers.utils.formatEther(v.giaTriXe),
        chuSoHuu: v.chuSoHuu,
        isRegistered: v.isRegistered,
        ipfsMetadata: v.ipfsMetadata,
      };
    } catch (err) {
      console.error("getVehicle error:", err);
      return null;
    }
  }

  async getUserVehicles(userAddress, provider) {
    try {
      const contract = this.initContract(provider);
      const bienSoList = await contract.getUserVehicles(userAddress);
      const vehicles = await Promise.all(
        bienSoList.map((bs) => this.getVehicle(bs, provider))
      );
      return vehicles.filter(Boolean);
    } catch (err) {
      console.error("getUserVehicles error:", err);
      return [];
    }
  }

  async getVehiclePolicies(bienSo, provider) {
    try {
      const contract = this.initContract(provider);
      const ids = await contract.getVehiclePolicies(bienSo);
      const policies = await Promise.all(
        ids.map((id) => this.getPolicy(id.toString(), provider))
      );
      return policies.filter(Boolean);
    } catch (err) {
      console.error("getVehiclePolicies error:", err);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════
  // PHÍ BẢO HIỂM
  // ═══════════════════════════════════════════════════════

  async tinhPhiBaoHiem(bienSo, insuranceType, paymentType, provider) {
    try {
      const contract = this.initContract(provider);
      const fee = await contract.tinhPhiBaoHiem(bienSo, insuranceType, paymentType);
      return ethers.utils.formatEther(fee);
    } catch (err) {
      console.error("tinhPhiBaoHiem error:", err);
      return "0";
    }
  }

  async tinhMucBoiThuong(bienSo, insuranceType, provider) {
    try {
      const contract = this.initContract(provider);
      const amount = await contract.tinhMucBoiThuong(bienSo, insuranceType);
      return ethers.utils.formatEther(amount);
    } catch (err) {
      console.error("tinhMucBoiThuong error:", err);
      return "0";
    }
  }

  // ═══════════════════════════════════════════════════════
  // HỢP ĐỒNG BẢO HIỂM (POLICY)
  // ═══════════════════════════════════════════════════════

  async muaBaoHiem(bienSo, insuranceType, paymentType, ipfsMetadata, paymentAmount, signer) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.muaBaoHiem(
        bienSo,
        insuranceType,
        paymentType,
        ipfsMetadata,
        {
          value: ethers.utils.parseEther(paymentAmount.toString()),
          gasLimit: 500000,
        }
      );
      toast.loading("Đang mua bảo hiểm...", { id: "muabh" });
      const receipt = await tx.wait();
      toast.success("Mua bảo hiểm thành công!", { id: "muabh" });
      return { success: true, receipt, txHash: tx.hash };
    } catch (err) {
      console.error("muaBaoHiem error:", err);
      toast.error(this._parseError(err), { id: "muabh" });
      return { success: false, error: err.message };
    }
  }

  async giaHanHangThang(policyId, signer) {
    try {
      const contract = this.initContract(signer, true);

      // Lấy phí gia hạn từ contract
      const policy = await contract.policies(policyId);
      const fee = await contract.tinhPhiBaoHiem(
        policy.vehicleBienSo,
        policy.insuranceType,
        PAYMENT_TYPES.MONTHLY
      );

      const tx = await contract.giaHanHangThang(policyId, {
        value: fee,
        gasLimit: 300000,
      });
      toast.loading("Đang gia hạn hợp đồng...", { id: "giahan" });
      const receipt = await tx.wait();
      toast.success("Gia hạn thành công!", { id: "giahan" });
      return { success: true, receipt, txHash: tx.hash };
    } catch (err) {
      console.error("giaHanHangThang error:", err);
      toast.error(this._parseError(err), { id: "giahan" });
      return { success: false, error: err.message };
    }
  }

  async huyHopDong(policyId, signer) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.huyHopDong(policyId, { gasLimit: 200000 });
      toast.loading("Đang hủy hợp đồng...", { id: "huy" });
      const receipt = await tx.wait();
      toast.success("Hủy hợp đồng thành công!", { id: "huy" });
      return { success: true, receipt, txHash: tx.hash };
    } catch (err) {
      console.error("huyHopDong error:", err);
      toast.error(this._parseError(err), { id: "huy" });
      return { success: false, error: err.message };
    }
  }

  async getPolicy(policyId, provider) {
    try {
      const contract = this.initContract(provider);
      const p = await contract.policies(policyId);
      return {
        policyId: p.policyId.toString(),
        vehicleBienSo: p.vehicleBienSo,
        policyholder: p.policyholder,
        insuranceType: Number(p.insuranceType),
        insuranceTypeLabel: INSURANCE_TYPE_LABELS[Number(p.insuranceType)] || "Không rõ",
        paymentType: Number(p.paymentType),
        status: Number(p.status),
        statusLabel: POLICY_STATUS_LABELS[Number(p.status)] || "Không rõ",
        startDate: p.startDate.toString(),
        endDate: p.endDate.toString(),
        lastPaymentDate: p.lastPaymentDate.toString(),
        premium: ethers.utils.formatEther(p.premium),
        coverageAmount: ethers.utils.formatEther(p.coverageAmount),
        ipfsMetadata: p.ipfsMetadata,
        totalPaid: ethers.utils.formatEther(p.totalPaid),
        claimsUsed: ethers.utils.formatEther(p.claimsUsed),
      };
    } catch (err) {
      console.error("getPolicy error:", err);
      return null;
    }
  }

  async getUserPolicies(userAddress, provider) {
    try {
      const contract = this.initContract(provider);
      const ids = await contract.getUserPolicies(userAddress);
      const policies = await Promise.all(
        ids.map((id) => this.getPolicy(id.toString(), provider))
      );
      return policies.filter(Boolean);
    } catch (err) {
      console.error("getUserPolicies error:", err);
      return [];
    }
  }

  async isPolicyValid(policyId, provider) {
    try {
      const contract = this.initContract(provider);
      return await contract.isPolicyValid(policyId);
    } catch (err) {
      console.error("isPolicyValid error:", err);
      return false;
    }
  }

  async getRemainingCoverage(policyId, provider) {
    try {
      const contract = this.initContract(provider);
      const remaining = await contract.getRemainingCoverage(policyId);
      return ethers.utils.formatEther(remaining);
    } catch (err) {
      console.error("getRemainingCoverage error:", err);
      return "0";
    }
  }

  // ═══════════════════════════════════════════════════════
  // YÊU CẦU BỒI THƯỜNG (CLAIM)
  // ═══════════════════════════════════════════════════════

  async yeuCauBoiThuong(policyId, claimAmount, ipfsDocuments, description, signer) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.yeuCauBoiThuong(
        policyId,
        ethers.utils.parseEther(claimAmount.toString()),
        ipfsDocuments,
        description,
        { gasLimit: 400000 }
      );
      toast.loading("Đang nộp yêu cầu bồi thường...", { id: "claim" });
      const receipt = await tx.wait();
      toast.success("Nộp yêu cầu thành công!", { id: "claim" });
      return { success: true, receipt, txHash: tx.hash };
    } catch (err) {
      console.error("yeuCauBoiThuong error:", err);
      toast.error(this._parseError(err), { id: "claim" });
      return { success: false, error: err.message };
    }
  }

  async garageCapNhatTrangThai(claimId, newStatus, tenGarage, lyDo, signer) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.garageCapNhatTrangThai(
        claimId,
        newStatus,
        tenGarage,
        lyDo,
        { gasLimit: 300000 }
      );
      toast.loading("Đang cập nhật trạng thái...", { id: "garage" });
      const receipt = await tx.wait();
      toast.success("Cập nhật trạng thái thành công!", { id: "garage" });
      return { success: true, receipt, txHash: tx.hash };
    } catch (err) {
      console.error("garageCapNhatTrangThai error:", err);
      toast.error(this._parseError(err), { id: "garage" });
      return { success: false, error: err.message };
    }
  }

  async adminXuLyClaim(claimId, isApproved, approvedAmount, lyDo, signer) {
    try {
      const contract = this.initContract(signer, true);
      const amountWei = isApproved
        ? ethers.utils.parseEther(approvedAmount.toString())
        : ethers.utils.parseEther("0");

      const tx = await contract.adminXuLyClaim(
        claimId,
        isApproved,
        amountWei,
        lyDo || "",
        { gasLimit: 400000 }
      );
      toast.loading("Đang xử lý bồi thường...", { id: "admin-claim" });
      const receipt = await tx.wait();
      toast.success(
        isApproved ? "Đã duyệt yêu cầu bồi thường!" : "Đã từ chối yêu cầu bồi thường",
        { id: "admin-claim" }
      );
      return { success: true, receipt, txHash: tx.hash };
    } catch (err) {
      console.error("adminXuLyClaim error:", err);
      toast.error(this._parseError(err), { id: "admin-claim" });
      return { success: false, error: err.message };
    }
  }

  async chiTraBoiThuong(claimId, signer) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.chiTraBoiThuong(claimId, { gasLimit: 300000 });
      toast.loading("Đang chi trả bồi thường...", { id: "chitra" });
      const receipt = await tx.wait();
      toast.success("Chi trả bồi thường thành công!", { id: "chitra" });
      return { success: true, receipt, txHash: tx.hash };
    } catch (err) {
      console.error("chiTraBoiThuong error:", err);
      toast.error(this._parseError(err), { id: "chitra" });
      return { success: false, error: err.message };
    }
  }

  async getClaim(claimId, provider) {
    try {
      const contract = this.initContract(provider);
      const c = await contract.claims(claimId);
      return {
        claimId: c.claimId.toString(),
        policyId: c.policyId.toString(),
        claimant: c.claimant,
        claimAmount: ethers.utils.formatEther(c.claimAmount),
        approvedAmount: ethers.utils.formatEther(c.approvedAmount),
        status: Number(c.status),
        statusLabel: CLAIM_STATUS_LABELS[Number(c.status)] || "Không rõ",
        submissionDate: Number(c.submissionDate) * 1000,
        processedDate: Number(c.processedDate) * 1000,
        ipfsDocuments: c.ipfsDocuments,
        description: c.description,
        processedBy: c.processedBy,
        lyDoTuChoi: c.lyDoTuChoi,
        tenGarage: c.tenGarage,
      };
    } catch (err) {
      console.error("getClaim error:", err);
      return null;
    }
  }

  async getPolicyClaims(policyId, provider) {
    try {
      const contract = this.initContract(provider);
      const ids = await contract.getPolicyClaims(policyId);
      const claims = await Promise.all(
        ids.map((id) => this.getClaim(id.toString(), provider))
      );
      return claims.filter(Boolean);
    } catch (err) {
      console.error("getPolicyClaims error:", err);
      return [];
    }
  }

  async fetchAllClaims(provider) {
    try {
      const contract = this.initContract(provider);
      const total = Number(await contract.getTotalClaims());
      if (total === 0) return { success: true, claims: [] };

      // Parallel fetch tất cả claims cùng lúc (thay vì sequential N+1)
      const claimIds = Array.from({ length: total }, (_, i) => i + 1);
      const claimResults = await Promise.all(
        claimIds.map((id) => this.getClaim(id, provider).catch(() => null))
      );
      const validClaims = claimResults.filter(Boolean);

      // Parallel fetch tất cả policies tương ứng
      const policyResults = await Promise.all(
        validClaims.map((claim) =>
          contract.policies(claim.policyId).catch(() => null)
        )
      );

      const claims = validClaims.map((claim, idx) => {
        const policy = policyResults[idx];
        return {
          ...claim,
          vehicleBienSo: policy ? policy.vehicleBienSo : "",
          insuranceTypeLabel: policy
            ? INSURANCE_TYPE_LABELS[Number(policy.insuranceType)] || "Không rõ"
            : "Không rõ",
        };
      });

      return { success: true, claims };
    } catch (err) {
      console.error("fetchAllClaims error:", err);
      return { success: false, error: err.message, claims: [] };
    }
  }

  async getGarageList(provider) {
    try {
      const contract = this.initContract(provider);
      const addresses = await contract.getGarageList();
      const statusResults = await Promise.all(
        addresses.map((addr) => contract.authorizedGarages(addr).catch(() => false))
      );
      return addresses.map((addr, i) => ({
        address: addr,
        isActive: statusResults[i],
      }));
    } catch (err) {
      console.error("getGarageList error:", err);
      return [];
    }
  }

  async getIsPaused(provider) {
    try {
      const contract = this.initContract(provider);
      return await contract.paused();
    } catch (err) {
      console.error("getIsPaused error:", err);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════
  // ADMIN FUNCTIONS
  // ═══════════════════════════════════════════════════════

  async capQuyenGarage(garageAddress, status, signer) {
    try {
      if (!ethers.utils.isAddress(garageAddress)) {
        toast.error("Địa chỉ garage không hợp lệ");
        return { success: false, error: "Invalid address" };
      }
      const contract = this.initContract(signer, true);
      const tx = await contract.capQuyenGarage(garageAddress, status, { gasLimit: 250000 });
      const action = status ? "Cấp quyền" : "Thu hồi quyền";
      toast.loading(`${action} garage...`, { id: "garage-auth" });
      const receipt = await tx.wait();
      toast.success(`${action} garage thành công!`, { id: "garage-auth" });
      return { success: true, receipt, txHash: tx.hash };
    } catch (err) {
      console.error("capQuyenGarage error:", err);
      toast.error(this._parseError(err), { id: "garage-auth" });
      return { success: false, error: err.message };
    }
  }

  async rutTien(amount, signer) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.rutTien(
        ethers.utils.parseEther(amount.toString()),
        { gasLimit: 100000 }
      );
      toast.loading("Đang rút tiền...", { id: "withdraw" });
      const receipt = await tx.wait();
      toast.success(`Rút ${amount} ETH thành công!`, { id: "withdraw" });
      return { success: true, receipt, txHash: tx.hash };
    } catch (err) {
      console.error("rutTien error:", err);
      toast.error(this._parseError(err), { id: "withdraw" });
      return { success: false, error: err.message };
    }
  }

  async pauseContract(signer) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.pause({ gasLimit: 100000 });
      const receipt = await tx.wait();
      toast.success("Contract đã tạm dừng");
      return { success: true, receipt };
    } catch (err) {
      toast.error(this._parseError(err));
      return { success: false, error: err.message };
    }
  }

  async unpauseContract(signer) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.unpause({ gasLimit: 100000 });
      const receipt = await tx.wait();
      toast.success("Contract đã hoạt động trở lại");
      return { success: true, receipt };
    } catch (err) {
      toast.error(this._parseError(err));
      return { success: false, error: err.message };
    }
  }

  // ═══════════════════════════════════════════════════════
  // THỐNG KÊ
  // ═══════════════════════════════════════════════════════

  async getContractStats(provider) {
    try {
      const contract = this.initContract(provider);
      const [totalPolicies, totalClaims, balance] = await Promise.all([
        contract.getTotalPolicies(),
        contract.getTotalClaims(),
        contract.getContractBalance(),
      ]);
      return {
        totalPolicies: totalPolicies.toString(),
        totalClaims: totalClaims.toString(),
        contractBalance: ethers.utils.formatEther(balance),
      };
    } catch (err) {
      console.error("getContractStats error:", err);
      return { totalPolicies: "0", totalClaims: "0", contractBalance: "0" };
    }
  }
}

export const contractService = new ContractService();
