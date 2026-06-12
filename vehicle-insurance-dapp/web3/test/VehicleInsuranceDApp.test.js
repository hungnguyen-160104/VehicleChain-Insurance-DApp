const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");

// Enum values khớp contract
const VehicleType = { XE_MAY: 0, O_TO_CON: 1, O_TO_KINH_DOANH: 2, XE_TAI: 3 };
const InsuranceType = { TNDS_BAT_BUOC: 0, VAT_CHAT_XE: 1, NGUOI_TREN_XE: 2, TAI_NAN_LAI_XE: 3 };
const PaymentType = { ONE_TIME: 0, MONTHLY: 1 };
const ClaimStatus = {
  PENDING: 0, DANG_GIAM_DINH: 1, CHO_HO_SO: 2, DANG_THAM_DINH: 3,
  APPROVED: 4, REJECTED: 5, PAID: 6,
};

const E = (v) => ethers.parseEther(v);
const CID = "QmTestCid123";

describe("VehicleInsuranceDApp", function () {
  async function deployFixture() {
    const [owner, user, garage, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("VehicleInsuranceDApp");
    const dapp = await Factory.deploy();
    return { dapp, owner, user, garage, other };
  }

  // Xe ô tô con đã đăng ký + hợp đồng TNDS ONE_TIME đang ACTIVE
  async function policyFixture() {
    const base = await deployFixture();
    const { dapp, user } = base;
    await dapp.connect(user).dangKyXe("29A-12345", VehicleType.O_TO_CON, 2020, E("10"), CID);
    const premium = await dapp.tinhPhiBaoHiem("29A-12345", InsuranceType.TNDS_BAT_BUOC, PaymentType.ONE_TIME);
    await dapp.connect(user).muaBaoHiem("29A-12345", InsuranceType.TNDS_BAT_BUOC, PaymentType.ONE_TIME, CID, { value: premium });
    return { ...base, premium, policyId: 1n };
  }

  // Claim đã nộp trên policy 1
  async function claimFixture() {
    const base = await policyFixture();
    const { dapp, user, garage, owner } = base;
    await dapp.connect(owner).capQuyenGarage(garage.address, true);
    await dapp.connect(user).yeuCauBoiThuong(1, E("1"), CID, "Va cham giao thong");
    return { ...base, claimId: 1n };
  }

  // ═════════════ A1. ĐĂNG KÝ XE ═════════════
  describe("A1 - dangKyXe", function () {
    it("dang ky thanh cong, emit XeDaDangKy, luu dung du lieu", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      await expect(dapp.connect(user).dangKyXe("29A-11111", VehicleType.O_TO_CON, 2021, E("5"), CID))
        .to.emit(dapp, "XeDaDangKy");
      const v = await dapp.getVehicle("29A-11111");
      expect(v.chuSoHuu).to.equal(user.address);
      expect(v.namSanXuat).to.equal(2021);
      expect(v.giaTriXe).to.equal(E("5"));
      expect(v.ipfsMetadata).to.equal(CID);
    });

    it("trung bien so -> revert", async function () {
      const { dapp, user, other } = await loadFixture(deployFixture);
      await dapp.connect(user).dangKyXe("29A-11111", VehicleType.XE_MAY, 2021, 0, CID);
      await expect(
        dapp.connect(other).dangKyXe("29A-11111", VehicleType.XE_MAY, 2021, 0, CID)
      ).to.be.revertedWith("Xe da duoc dang ky");
    });

    it("bien so rong -> revert", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      await expect(
        dapp.connect(user).dangKyXe("", VehicleType.XE_MAY, 2021, 0, CID)
      ).to.be.revertedWith("Bien so khong duoc trong");
    });

    it("nam san xuat 1900 va 2100 -> revert; 1901 va 2099 -> ok", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      await expect(dapp.connect(user).dangKyXe("A1", VehicleType.XE_MAY, 1900, 0, CID))
        .to.be.revertedWith("Nam san xuat khong hop le");
      await expect(dapp.connect(user).dangKyXe("A2", VehicleType.XE_MAY, 2100, 0, CID))
        .to.be.revertedWith("Nam san xuat khong hop le");
      await dapp.connect(user).dangKyXe("A3", VehicleType.XE_MAY, 1901, 0, CID);
      await dapp.connect(user).dangKyXe("A4", VehicleType.XE_MAY, 2099, 0, CID);
    });

    it("o to / xe tai gia tri 0 -> revert; xe may gia tri 0 -> ok", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      for (const t of [VehicleType.O_TO_CON, VehicleType.O_TO_KINH_DOANH, VehicleType.XE_TAI]) {
        await expect(dapp.connect(user).dangKyXe(`B${t}`, t, 2020, 0, CID))
          .to.be.revertedWith("O to/xe tai phai khai bao gia tri xe");
      }
      await dapp.connect(user).dangKyXe("B-XM", VehicleType.XE_MAY, 2020, 0, CID);
    });

    it("paused -> revert EnforcedPause", async function () {
      const { dapp, owner, user } = await loadFixture(deployFixture);
      await dapp.connect(owner).pause();
      await expect(
        dapp.connect(user).dangKyXe("29A-99999", VehicleType.XE_MAY, 2020, 0, CID)
      ).to.be.revertedWithCustomError(dapp, "EnforcedPause");
    });
  });

  // ═════════════ A2. MUA BẢO HIỂM ═════════════
  describe("A2 - muaBaoHiem", function () {
    it("khong phai chu xe -> revert", async function () {
      const { dapp, user, other } = await loadFixture(deployFixture);
      await dapp.connect(user).dangKyXe("29A-12345", VehicleType.O_TO_CON, 2020, E("10"), CID);
      await expect(
        dapp.connect(other).muaBaoHiem("29A-12345", InsuranceType.TNDS_BAT_BUOC, PaymentType.ONE_TIME, CID, { value: E("1") })
      ).to.be.revertedWith("Ban khong phai chu xe");
    });

    it("xe chua dang ky -> revert", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      await expect(
        dapp.connect(user).muaBaoHiem("KHONG-TON-TAI", InsuranceType.TNDS_BAT_BUOC, PaymentType.ONE_TIME, CID, { value: E("1") })
      ).to.be.revertedWith("Xe chua duoc dang ky");
    });

    it("thieu phi -> revert", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      await dapp.connect(user).dangKyXe("29A-12345", VehicleType.O_TO_CON, 2020, E("10"), CID);
      await expect(
        dapp.connect(user).muaBaoHiem("29A-12345", InsuranceType.TNDS_BAT_BUOC, PaymentType.ONE_TIME, CID, { value: E("0.004") })
      ).to.be.revertedWith("So tien gui vao khong du phi");
    });

    it("hoan tien thua dung: user chi mat dung premium + gas", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      await dapp.connect(user).dangKyXe("29A-12345", VehicleType.O_TO_CON, 2020, E("10"), CID);
      const premium = E("0.005"); // TNDS O_TO_CON ONE_TIME
      // gui thua gap doi -> chi bi tru dung premium
      await expect(
        dapp.connect(user).muaBaoHiem("29A-12345", InsuranceType.TNDS_BAT_BUOC, PaymentType.ONE_TIME, CID, { value: E("0.01") })
      ).to.changeEtherBalances([user, dapp], [-premium, premium]);
    });

    it("trung loai bao hiem con ACTIVE -> revert; loai khac van mua duoc", async function () {
      const { dapp, user } = await loadFixture(policyFixture);
      await expect(
        dapp.connect(user).muaBaoHiem("29A-12345", InsuranceType.TNDS_BAT_BUOC, PaymentType.MONTHLY, CID, { value: E("1") })
      ).to.be.revertedWith("Da co hop dong loai nay con hieu luc");
      // loai khac (NGUOI_TREN_XE) mua binh thuong
      await dapp.connect(user).muaBaoHiem("29A-12345", InsuranceType.NGUOI_TREN_XE, PaymentType.ONE_TIME, CID, { value: E("0.002") });
    });

    it("ONE_TIME = 365 ngay, MONTHLY = 30 ngay", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      await dapp.connect(user).dangKyXe("29A-12345", VehicleType.O_TO_CON, 2020, E("10"), CID);
      await dapp.connect(user).muaBaoHiem("29A-12345", InsuranceType.TNDS_BAT_BUOC, PaymentType.ONE_TIME, CID, { value: E("0.005") });
      let p = await dapp.policies(1);
      expect(p.endDate - p.startDate).to.equal(BigInt(365 * 24 * 3600));
      await dapp.connect(user).muaBaoHiem("29A-12345", InsuranceType.NGUOI_TREN_XE, PaymentType.MONTHLY, CID, { value: E("0.0002") });
      p = await dapp.policies(2);
      expect(p.endDate - p.startDate).to.equal(BigInt(30 * 24 * 3600));
    });

    it("bang phi day du: 4 loai xe x TNDS x 2 hinh thuc + 3 loai BH khac", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      const cases = [
        ["XM", VehicleType.XE_MAY, "0.001", "0.0001"],
        ["OTC", VehicleType.O_TO_CON, "0.005", "0.0005"],
        ["OTKD", VehicleType.O_TO_KINH_DOANH, "0.01", "0.001"],
        ["XT", VehicleType.XE_TAI, "0.015", "0.0015"],
      ];
      for (const [bs, vt, oneTime, monthly] of cases) {
        await dapp.connect(user).dangKyXe(bs, vt, 2020, E("10"), CID);
        expect(await dapp.tinhPhiBaoHiem(bs, InsuranceType.TNDS_BAT_BUOC, PaymentType.ONE_TIME)).to.equal(E(oneTime));
        expect(await dapp.tinhPhiBaoHiem(bs, InsuranceType.TNDS_BAT_BUOC, PaymentType.MONTHLY)).to.equal(E(monthly));
      }
      // VAT_CHAT_XE = 1.5% gia tri xe / nam (xe gia 10 ETH -> 0.15 ETH/nam)
      expect(await dapp.tinhPhiBaoHiem("OTC", InsuranceType.VAT_CHAT_XE, PaymentType.ONE_TIME)).to.equal(E("0.15"));
      expect(await dapp.tinhPhiBaoHiem("OTC", InsuranceType.VAT_CHAT_XE, PaymentType.MONTHLY)).to.equal(E("0.15") / 12n);
      // NGUOI_TREN_XE & TAI_NAN_LAI_XE
      expect(await dapp.tinhPhiBaoHiem("OTC", InsuranceType.NGUOI_TREN_XE, PaymentType.ONE_TIME)).to.equal(E("0.002"));
      expect(await dapp.tinhPhiBaoHiem("OTC", InsuranceType.NGUOI_TREN_XE, PaymentType.MONTHLY)).to.equal(E("0.0002"));
      expect(await dapp.tinhPhiBaoHiem("OTC", InsuranceType.TAI_NAN_LAI_XE, PaymentType.ONE_TIME)).to.equal(E("0.001"));
      expect(await dapp.tinhPhiBaoHiem("OTC", InsuranceType.TAI_NAN_LAI_XE, PaymentType.MONTHLY)).to.equal(E("0.0001"));
    });

    it("muc boi thuong (coverage) dung theo loai", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      await dapp.connect(user).dangKyXe("XM", VehicleType.XE_MAY, 2020, 0, CID);
      await dapp.connect(user).dangKyXe("OTC", VehicleType.O_TO_CON, 2020, E("10"), CID);
      expect(await dapp.tinhMucBoiThuong("XM", InsuranceType.TNDS_BAT_BUOC)).to.equal(E("2.0"));
      expect(await dapp.tinhMucBoiThuong("OTC", InsuranceType.TNDS_BAT_BUOC)).to.equal(E("2.5"));
      expect(await dapp.tinhMucBoiThuong("OTC", InsuranceType.VAT_CHAT_XE)).to.equal(E("10"));
      expect(await dapp.tinhMucBoiThuong("OTC", InsuranceType.NGUOI_TREN_XE)).to.equal(E("2.5"));
      expect(await dapp.tinhMucBoiThuong("OTC", InsuranceType.TAI_NAN_LAI_XE)).to.equal(E("0.3"));
    });

    it("VAT_CHAT_XE khi gia tri xe = 0 -> revert", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      await dapp.connect(user).dangKyXe("XM", VehicleType.XE_MAY, 2020, 0, CID);
      await expect(
        dapp.connect(user).muaBaoHiem("XM", InsuranceType.VAT_CHAT_XE, PaymentType.ONE_TIME, CID, { value: E("1") })
      ).to.be.revertedWith("Gia tri xe chua duoc khai bao");
    });

    it("paused -> revert", async function () {
      const { dapp, owner, user } = await loadFixture(deployFixture);
      await dapp.connect(user).dangKyXe("29A-12345", VehicleType.O_TO_CON, 2020, E("10"), CID);
      await dapp.connect(owner).pause();
      await expect(
        dapp.connect(user).muaBaoHiem("29A-12345", InsuranceType.TNDS_BAT_BUOC, PaymentType.ONE_TIME, CID, { value: E("0.005") })
      ).to.be.revertedWithCustomError(dapp, "EnforcedPause");
    });
  });

  // ═════════════ A3. GIA HẠN HÀNG THÁNG ═════════════
  describe("A3 - giaHanHangThang", function () {
    async function monthlyFixture() {
      const base = await deployFixture();
      const { dapp, user } = base;
      await dapp.connect(user).dangKyXe("29A-12345", VehicleType.O_TO_CON, 2020, E("10"), CID);
      await dapp.connect(user).muaBaoHiem("29A-12345", InsuranceType.TNDS_BAT_BUOC, PaymentType.MONTHLY, CID, { value: E("0.0005") });
      return base;
    }

    it("hop dong ONE_TIME -> revert", async function () {
      const { dapp, user } = await loadFixture(policyFixture);
      await expect(
        dapp.connect(user).giaHanHangThang(1, { value: E("0.0005") })
      ).to.be.revertedWith("Khong phai hop dong hang thang");
    });

    it("gia han som hon 7 ngay truoc het han -> revert", async function () {
      const { dapp, user } = await loadFixture(monthlyFixture);
      await expect(
        dapp.connect(user).giaHanHangThang(1, { value: E("0.0005") })
      ).to.be.revertedWith("Chua den ky gia han (chi duoc gia han trong vong 7 ngay truoc khi het han)");
    });

    it("nguoi khac gia han -> revert", async function () {
      const { dapp, other } = await loadFixture(monthlyFixture);
      await time.increase(24 * 24 * 3600);
      await expect(
        dapp.connect(other).giaHanHangThang(1, { value: E("0.0005") })
      ).to.be.revertedWith("Khong phai chu hop dong");
    });

    it("hop dong da huy -> revert", async function () {
      const { dapp, user } = await loadFixture(monthlyFixture);
      await dapp.connect(user).huyHopDong(1);
      await time.increase(24 * 24 * 3600);
      await expect(
        dapp.connect(user).giaHanHangThang(1, { value: E("0.0005") })
      ).to.be.revertedWith("Hop dong khong con hieu luc");
    });

    it("gia han thanh cong trong cua so 7 ngay: endDate = now + 30 ngay, emit PhiDaGiaHan", async function () {
      const { dapp, user } = await loadFixture(monthlyFixture);
      await time.increase(24 * 24 * 3600); // ngay 24/30 -> trong cua so 7 ngay
      const tx = await dapp.connect(user).giaHanHangThang(1, { value: E("0.0005") });
      await expect(tx).to.emit(dapp, "PhiDaGiaHan");
      const block = await ethers.provider.getBlock((await tx.wait()).blockNumber);
      const p = await dapp.policies(1);
      expect(p.endDate).to.equal(BigInt(block.timestamp + 30 * 24 * 3600));
      expect(p.totalPaid).to.equal(E("0.001")); // 2 lan dong phi
    });
  });

  // ═════════════ A4. YÊU CẦU BỒI THƯỜNG ═════════════
  describe("A4 - yeuCauBoiThuong", function () {
    it("claimAmount = 0 -> revert", async function () {
      const { dapp, user } = await loadFixture(policyFixture);
      await expect(
        dapp.connect(user).yeuCauBoiThuong(1, 0, CID, "mo ta")
      ).to.be.revertedWith("So tien yeu cau phai lon hon 0");
    });

    it("vuot coverage con lai -> revert", async function () {
      const { dapp, user } = await loadFixture(policyFixture);
      // coverage TNDS o to = 2.5 ETH
      await expect(
        dapp.connect(user).yeuCauBoiThuong(1, E("2.6"), CID, "mo ta")
      ).to.be.revertedWith("So tien vuot qua muc boi thuong con lai");
    });

    it("hop dong het han -> revert", async function () {
      const { dapp, user } = await loadFixture(policyFixture);
      await time.increase(366 * 24 * 3600);
      await expect(
        dapp.connect(user).yeuCauBoiThuong(1, E("1"), CID, "mo ta")
      ).to.be.revertedWith("Hop dong da het han");
    });

    it("hop dong da huy (khong ACTIVE) -> revert", async function () {
      const { dapp, user } = await loadFixture(policyFixture);
      await dapp.connect(user).huyHopDong(1);
      await expect(
        dapp.connect(user).yeuCauBoiThuong(1, E("1"), CID, "mo ta")
      ).to.be.revertedWith("Hop dong khong con hieu luc");
    });

    it("khong phai chu hop dong -> revert", async function () {
      const { dapp, other } = await loadFixture(policyFixture);
      await expect(
        dapp.connect(other).yeuCauBoiThuong(1, E("1"), CID, "mo ta")
      ).to.be.revertedWith("Khong phai chu hop dong");
    });

    it("hop le -> tao claim PENDING, emit YeuCauDaNop", async function () {
      const { dapp, user } = await loadFixture(policyFixture);
      await expect(dapp.connect(user).yeuCauBoiThuong(1, E("1"), CID, "Va cham"))
        .to.emit(dapp, "YeuCauDaNop")
        .withArgs(1, 1, user.address, E("1"));
      const c = await dapp.claims(1);
      expect(c.status).to.equal(ClaimStatus.PENDING);
      expect(c.claimant).to.equal(user.address);
      expect(c.ipfsDocuments).to.equal(CID);
    });
  });

  // ═════════════ A5. GARAGE CẬP NHẬT TRẠNG THÁI ═════════════
  describe("A5 - garageCapNhatTrangThai", function () {
    it("chua duoc cap quyen -> revert", async function () {
      const { dapp, other } = await loadFixture(claimFixture);
      await expect(
        dapp.connect(other).garageCapNhatTrangThai(1, ClaimStatus.DANG_GIAM_DINH, "Garage X", "")
      ).to.be.revertedWith("Khong co quyen cap nhat");
    });

    it("garage: PENDING -> DANG_GIAM_DINH -> CHO_HO_SO ok, kem ten garage", async function () {
      const { dapp, garage } = await loadFixture(claimFixture);
      await expect(dapp.connect(garage).garageCapNhatTrangThai(1, ClaimStatus.DANG_GIAM_DINH, "Garage X", ""))
        .to.emit(dapp, "TrangThaiCapNhat").withArgs(1, ClaimStatus.DANG_GIAM_DINH, garage.address);
      await dapp.connect(garage).garageCapNhatTrangThai(1, ClaimStatus.CHO_HO_SO, "Garage X", "Cho bo sung hoa don");
      const c = await dapp.claims(1);
      expect(c.status).to.equal(ClaimStatus.CHO_HO_SO);
      expect(c.tenGarage).to.equal("Garage X");
    });

    it("garage nhay buoc PENDING -> CHO_HO_SO -> revert", async function () {
      const { dapp, garage } = await loadFixture(claimFixture);
      await expect(
        dapp.connect(garage).garageCapNhatTrangThai(1, ClaimStatus.CHO_HO_SO, "Garage X", "")
      ).to.be.revertedWith("Garage chi duoc cap nhat buoc giam dinh");
    });

    it("garage khong duoc chuyen CHO_HO_SO -> DANG_THAM_DINH", async function () {
      const { dapp, garage } = await loadFixture(claimFixture);
      await dapp.connect(garage).garageCapNhatTrangThai(1, ClaimStatus.DANG_GIAM_DINH, "G", "");
      await dapp.connect(garage).garageCapNhatTrangThai(1, ClaimStatus.CHO_HO_SO, "G", "");
      await expect(
        dapp.connect(garage).garageCapNhatTrangThai(1, ClaimStatus.DANG_THAM_DINH, "G", "")
      ).to.be.revertedWith("Garage chi duoc cap nhat buoc giam dinh");
    });

    it("owner: CHO_HO_SO -> DANG_THAM_DINH ok; chuyen sai -> revert", async function () {
      const { dapp, garage, owner } = await loadFixture(claimFixture);
      await dapp.connect(garage).garageCapNhatTrangThai(1, ClaimStatus.DANG_GIAM_DINH, "G", "");
      await dapp.connect(garage).garageCapNhatTrangThai(1, ClaimStatus.CHO_HO_SO, "G", "");
      // owner chuyen sai: CHO_HO_SO -> PAID
      await expect(
        dapp.connect(owner).garageCapNhatTrangThai(1, ClaimStatus.PAID, "G", "")
      ).to.be.revertedWith("Chuyen trang thai khong hop le");
      await dapp.connect(owner).garageCapNhatTrangThai(1, ClaimStatus.DANG_THAM_DINH, "G", "");
      expect((await dapp.claims(1)).status).to.equal(ClaimStatus.DANG_THAM_DINH);
    });

    it("claimId khong hop le -> revert", async function () {
      const { dapp, garage } = await loadFixture(claimFixture);
      await expect(
        dapp.connect(garage).garageCapNhatTrangThai(99, ClaimStatus.DANG_GIAM_DINH, "G", "")
      ).to.be.revertedWith("ID khieu nai khong hop le");
    });
  });

  // ═════════════ A6. ADMIN DUYỆT / CHI TRẢ ═════════════
  describe("A6 - adminXuLyClaim & chiTraBoiThuong", function () {
    // claim da qua giam dinh, dang o CHO_HO_SO
    async function readyClaimFixture() {
      const base = await claimFixture();
      const { dapp, garage } = base;
      await dapp.connect(garage).garageCapNhatTrangThai(1, ClaimStatus.DANG_GIAM_DINH, "Garage X", "");
      await dapp.connect(garage).garageCapNhatTrangThai(1, ClaimStatus.CHO_HO_SO, "Garage X", "");
      return base;
    }

    it("non-owner duyet -> revert OwnableUnauthorizedAccount", async function () {
      const { dapp, user } = await loadFixture(readyClaimFixture);
      await expect(
        dapp.connect(user).adminXuLyClaim(1, true, E("1"), "")
      ).to.be.revertedWithCustomError(dapp, "OwnableUnauthorizedAccount");
    });

    it("duyet claim dang PENDING (sai buoc) -> revert", async function () {
      const { dapp, owner } = await loadFixture(claimFixture); // claim van PENDING
      await expect(
        dapp.connect(owner).adminXuLyClaim(1, true, E("1"), "")
      ).to.be.revertedWith("Claim phai o buoc CHO_HO_SO hoac DANG_THAM_DINH");
    });

    it("approvedAmount > claimAmount -> revert; = 0 -> revert", async function () {
      const { dapp, owner } = await loadFixture(readyClaimFixture);
      await expect(
        dapp.connect(owner).adminXuLyClaim(1, true, E("1.5"), "")
      ).to.be.revertedWith("So tien duyet vuot qua yeu cau");
      await expect(
        dapp.connect(owner).adminXuLyClaim(1, true, 0, "")
      ).to.be.revertedWith("So tien duyet phai lon hon 0");
    });

    it("duyet vuot coverage con lai (sau khi da chi tra claim khac) -> revert", async function () {
      const { dapp, user, garage, owner } = await loadFixture(policyFixture);
      await dapp.connect(owner).capQuyenGarage(garage.address, true);
      // coverage 2.5 ETH: claim1 = 2.0, claim2 = 2.0 (hop le tai thoi diem nop vi claimsUsed=0)
      await dapp.connect(user).yeuCauBoiThuong(1, E("2.0"), CID, "vu 1");
      await dapp.connect(user).yeuCauBoiThuong(1, E("2.0"), CID, "vu 2");
      for (const id of [1, 2]) {
        await dapp.connect(garage).garageCapNhatTrangThai(id, ClaimStatus.DANG_GIAM_DINH, "G", "");
        await dapp.connect(garage).garageCapNhatTrangThai(id, ClaimStatus.CHO_HO_SO, "G", "");
      }
      await dapp.connect(owner).adminXuLyClaim(1, true, E("2.0"), "");
      // nap ETH vao contract de du tien chi tra claim 1
      await owner.sendTransaction({ to: await dapp.getAddress(), value: E("3") });
      await dapp.connect(owner).chiTraBoiThuong(1); // claimsUsed = 2.0, con lai 0.5
      await expect(
        dapp.connect(owner).adminXuLyClaim(2, true, E("2.0"), "")
      ).to.be.revertedWith("Vuot qua muc boi thuong con lai");
    });

    it("duyet hop le -> APPROVED + luu approvedAmount", async function () {
      const { dapp, owner } = await loadFixture(readyClaimFixture);
      await dapp.connect(owner).adminXuLyClaim(1, true, E("0.8"), "");
      const c = await dapp.claims(1);
      expect(c.status).to.equal(ClaimStatus.APPROVED);
      expect(c.approvedAmount).to.equal(E("0.8"));
    });

    it("tu choi -> REJECTED + luu ly do", async function () {
      const { dapp, owner } = await loadFixture(readyClaimFixture);
      await dapp.connect(owner).adminXuLyClaim(1, false, 0, "Ho so khong hop le");
      const c = await dapp.claims(1);
      expect(c.status).to.equal(ClaimStatus.REJECTED);
      expect(c.lyDoTuChoi).to.equal("Ho so khong hop le");
    });

    it("chi tra claim chua APPROVED -> revert", async function () {
      const { dapp, owner } = await loadFixture(readyClaimFixture);
      await expect(dapp.connect(owner).chiTraBoiThuong(1))
        .to.be.revertedWith("Claim chua duoc duyet");
    });

    it("balance khong du -> revert", async function () {
      const { dapp, owner } = await loadFixture(readyClaimFixture);
      await dapp.connect(owner).adminXuLyClaim(1, true, E("1"), "");
      // rut het tien trong contract (chi co phi 0.005 ETH)
      await dapp.connect(owner).rutTien(await dapp.getContractBalance());
      await expect(dapp.connect(owner).chiTraBoiThuong(1))
        .to.be.revertedWith("Hop dong khong du tien");
    });

    it("chi tra hop le -> chuyen ETH dung nguoi, claimsUsed tang, PAID, emit event", async function () {
      const { dapp, owner, user } = await loadFixture(readyClaimFixture);
      await dapp.connect(owner).adminXuLyClaim(1, true, E("1"), "");
      // nap them ETH vao contract de du tien chi tra
      await owner.sendTransaction({ to: await dapp.getAddress(), value: E("2") });
      await expect(dapp.connect(owner).chiTraBoiThuong(1))
        .to.emit(dapp, "BoiThuongDaChiTra").withArgs(1, E("1"), user.address);
      expect((await dapp.claims(1)).status).to.equal(ClaimStatus.PAID);
      expect((await dapp.policies(1)).claimsUsed).to.equal(E("1"));
      expect(await dapp.getRemainingCoverage(1)).to.equal(E("1.5"));
    });

    it("chong chi tra 2 lan", async function () {
      const { dapp, owner } = await loadFixture(readyClaimFixture);
      await dapp.connect(owner).adminXuLyClaim(1, true, E("1"), "");
      await owner.sendTransaction({ to: await dapp.getAddress(), value: E("2") });
      await dapp.connect(owner).chiTraBoiThuong(1);
      await expect(dapp.connect(owner).chiTraBoiThuong(1))
        .to.be.revertedWith("Claim chua duoc duyet");
    });

    it("non-owner chi tra -> revert", async function () {
      const { dapp, user } = await loadFixture(readyClaimFixture);
      await expect(dapp.connect(user).chiTraBoiThuong(1))
        .to.be.revertedWithCustomError(dapp, "OwnableUnauthorizedAccount");
    });
  });

  // ═════════════ A7. QUẢN TRỊ & BẢO MẬT ═════════════
  describe("A7 - quan tri & bao mat", function () {
    it("pause/unpause chi owner", async function () {
      const { dapp, owner, user } = await loadFixture(deployFixture);
      await expect(dapp.connect(user).pause())
        .to.be.revertedWithCustomError(dapp, "OwnableUnauthorizedAccount");
      await dapp.connect(owner).pause();
      expect(await dapp.paused()).to.equal(true);
      await expect(dapp.connect(user).unpause())
        .to.be.revertedWithCustomError(dapp, "OwnableUnauthorizedAccount");
      await dapp.connect(owner).unpause();
      expect(await dapp.paused()).to.equal(false);
    });

    it("capQuyenGarage: chi owner, khong nhan address(0), khong trung trong garageList", async function () {
      const { dapp, owner, user, garage } = await loadFixture(deployFixture);
      await expect(dapp.connect(user).capQuyenGarage(garage.address, true))
        .to.be.revertedWithCustomError(dapp, "OwnableUnauthorizedAccount");
      await expect(dapp.connect(owner).capQuyenGarage(ethers.ZeroAddress, true))
        .to.be.revertedWith("Dia chi garage khong hop le");
      // cap quyen 2 lan lien tiep: khong trung trong list
      await dapp.connect(owner).capQuyenGarage(garage.address, true);
      await dapp.connect(owner).capQuyenGarage(garage.address, true);
      expect((await dapp.getGarageList()).length).to.equal(1);
      // thu hoi roi cap lai: van khong bi trung trong list
      await dapp.connect(owner).capQuyenGarage(garage.address, false);
      expect(await dapp.authorizedGarages(garage.address)).to.equal(false);
      await dapp.connect(owner).capQuyenGarage(garage.address, true);
      const list = await dapp.getGarageList();
      expect(list.length).to.equal(1);
      expect(list[0]).to.equal(garage.address);
      expect(await dapp.authorizedGarages(garage.address)).to.equal(true);
    });

    it("rutTien: chi owner, khong vuot balance, chuyen dung tien", async function () {
      const { dapp, owner, user } = await loadFixture(policyFixture);
      const bal = await dapp.getContractBalance(); // = premium 0.005
      await expect(dapp.connect(user).rutTien(bal))
        .to.be.revertedWithCustomError(dapp, "OwnableUnauthorizedAccount");
      await expect(dapp.connect(owner).rutTien(bal + 1n))
        .to.be.revertedWith("So du khong du");
      await expect(dapp.connect(owner).rutTien(bal))
        .to.changeEtherBalances([dapp, owner], [-bal, bal]);
    });

    it("ReentrancyGuard chan re-enter muaBaoHiem qua refund", async function () {
      const { dapp, user } = await loadFixture(deployFixture);
      const Attacker = await ethers.getContractFactory("ReentrancyAttacker");
      const attacker = await Attacker.deploy(await dapp.getAddress());
      await attacker.registerVehicle("ATTACK-XE-1");
      // gui thua tien -> refund kich hoat receive() -> re-enter bi guard chan -> refund fail -> tx revert
      await expect(
        attacker.buyWithExcess("ATTACK-XE-1", { value: E("0.5") })
      ).to.be.revertedWith("Hoan tien that bai");
      // gui dung phi (khong co refund) -> thanh cong binh thuong
      await attacker.buyWithExcess("ATTACK-XE-1", { value: E("0.001") });
      expect(await dapp.getTotalPolicies()).to.equal(1);
    });

    it("view functions tra dung du lieu", async function () {
      const { dapp, user } = await loadFixture(claimFixture);
      expect(await dapp.getTotalPolicies()).to.equal(1);
      expect(await dapp.getTotalClaims()).to.equal(1);
      expect((await dapp.getUserPolicies(user.address)).map(Number)).to.deep.equal([1]);
      expect((await dapp.getPolicyClaims(1)).map(Number)).to.deep.equal([1]);
      expect((await dapp.getUserVehicles(user.address))).to.deep.equal(["29A-12345"]);
      expect((await dapp.getVehiclePolicies("29A-12345")).map(Number)).to.deep.equal([1]);
      expect(await dapp.isPolicyValid(1)).to.equal(true);
      expect(await dapp.isPolicyValid(0)).to.equal(false);
      expect(await dapp.isPolicyValid(99)).to.equal(false);
      await expect(dapp.getVehicle("KHONG-CO")).to.be.revertedWith("Xe chua duoc dang ky");
      // het han -> khong con valid
      await time.increase(366 * 24 * 3600);
      expect(await dapp.isPolicyValid(1)).to.equal(false);
    });
  });
});
