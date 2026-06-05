// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VehicleInsuranceDApp
 * @dev Nền tảng bảo hiểm xe cơ giới phi tập trung theo quy định Việt Nam (NĐ 67/2023)
 * @dev Hỗ trợ 4 loại bảo hiểm: TNDS bắt buộc, vật chất xe, người trên xe, tai nạn lái xe
 */
contract VehicleInsuranceDApp is ReentrancyGuard, Ownable, Pausable {

    // ═══════════════════════════════════════════
    // COUNTERS
    // ═══════════════════════════════════════════

    uint256 private _policyIdCounter;
    uint256 private _claimIdCounter;

    // ═══════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════

    /// @dev Loại xe cơ giới
    enum VehicleType {
        XE_MAY,           // Xe máy, mô tô
        O_TO_CON,         // Ô tô con dưới 9 chỗ không kinh doanh
        O_TO_KINH_DOANH,  // Ô tô kinh doanh vận tải
        XE_TAI            // Xe tải, xe đầu kéo
    }

    /// @dev Loại bảo hiểm theo thực tế Việt Nam
    enum InsuranceType {
        TNDS_BAT_BUOC,  // Trách nhiệm dân sự bắt buộc - theo NĐ 67/2023
        VAT_CHAT_XE,    // Bảo hiểm vật chất xe (thân vỏ) - tự nguyện
        NGUOI_TREN_XE,  // Bảo hiểm người ngồi trên xe - tự nguyện
        TAI_NAN_LAI_XE  // Bảo hiểm tai nạn lái/phụ xe - tự nguyện
    }

    /// @dev Trạng thái hợp đồng bảo hiểm
    enum PolicyStatus { ACTIVE, EXPIRED, CANCELLED, SUSPENDED }

    /// @dev Trạng thái yêu cầu bồi thường - 5 bước theo quy trình thực tế
    enum ClaimStatus {
        PENDING,          // Bước 1: Khách vừa nộp yêu cầu
        DANG_GIAM_DINH,   // Bước 2: Garage/giám định viên đang giám định
        CHO_HO_SO,        // Bước 3: Chờ khách nộp đủ hồ sơ giấy tờ
        DANG_THAM_DINH,   // Bước 4: Công ty BH đang thẩm định nội bộ
        APPROVED,         // Đã duyệt - chờ chi trả
        REJECTED,         // Từ chối - có lý do
        PAID              // Bước 5: Đã chi trả xong
    }

    /// @dev Loại thanh toán phí bảo hiểm
    enum PaymentType { ONE_TIME, MONTHLY }

    // ═══════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════

    /**
     * @dev Thông tin xe cơ giới
     */
    struct Vehicle {
        string bienSo;          // Biển số xe - là unique key
        VehicleType loaiXe;
        uint16 namSanXuat;      // Năm sản xuất (ví dụ: 2020)
        uint256 giaTriXe;       // Giá trị xe (wei) - dùng tính phí VAT_CHAT_XE
        address chuSoHuu;       // Địa chỉ ví chủ xe
        bool isRegistered;
        string ipfsMetadata;    // IPFS: ảnh xe, đăng ký xe, giấy tờ
    }

    /**
     * @dev Hợp đồng bảo hiểm xe
     */
    struct Policy {
        uint256 policyId;
        string vehicleBienSo;        // Biển số xe được bảo hiểm
        address policyholder;
        InsuranceType insuranceType;  // Loại bảo hiểm
        PaymentType paymentType;
        PolicyStatus status;
        uint256 startDate;
        uint256 endDate;
        uint256 lastPaymentDate;
        uint256 premium;             // Phí đã đóng (wei)
        uint256 coverageAmount;      // Mức bồi thường tối đa
        string ipfsMetadata;         // IPFS: file hợp đồng
        uint256 totalPaid;
        uint256 claimsUsed;          // Tổng đã bồi thường
    }

    /**
     * @dev Yêu cầu bồi thường
     */
    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        uint256 claimAmount;        // Số tiền yêu cầu
        uint256 approvedAmount;     // Số tiền được duyệt (có thể khác claimAmount)
        ClaimStatus status;
        uint256 submissionDate;
        uint256 processedDate;
        string ipfsDocuments;       // IPFS: ảnh tai nạn, biên bản, hóa đơn sửa xe
        string description;         // Mô tả vụ tai nạn
        address processedBy;        // Địa chỉ garage hoặc admin đã xử lý
        string lyDoTuChoi;          // Lý do từ chối (nếu REJECTED)
        string tenGarage;           // Tên garage xử lý giám định
    }

    // ═══════════════════════════════════════════
    // STATE VARIABLES & MAPPINGS
    // ═══════════════════════════════════════════

    mapping(string => Vehicle) public vehicles;              // bienSo => Vehicle
    mapping(uint256 => Policy) public policies;              // policyId => Policy
    mapping(uint256 => Claim) public claims;                 // claimId => Claim

    mapping(address => string[]) private userVehicles;       // user => bienSo[]
    mapping(address => uint256[]) public userPolicies;       // user => policyId[]
    mapping(string => uint256[]) private vehiclePolicies;    // bienSo => policyId[]
    mapping(uint256 => uint256[]) public policyClaims;       // policyId => claimId[]

    mapping(address => bool) public authorizedGarages;       // Garage được ủy quyền giám định
    address[] private _garageList;                           // Danh sách địa chỉ garage đã từng được cấp quyền

    // ═══════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════

    event XeDaDangKy(string indexed bienSo, address indexed chuSoHuu, VehicleType loaiXe);
    event HopDongDaMua(
        uint256 indexed policyId,
        address indexed policyholder,
        string bienSo,
        InsuranceType insuranceType,
        uint256 premium
    );
    event PhiDaGiaHan(
        uint256 indexed policyId,
        address indexed policyholder,
        uint256 amount,
        uint256 timestamp
    );
    event YeuCauDaNop(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant,
        uint256 claimAmount
    );
    event TrangThaiCapNhat(uint256 indexed claimId, ClaimStatus newStatus, address updatedBy);
    event BoiThuongDaChiTra(uint256 indexed claimId, uint256 amount, address recipient);
    event HopDongDaHuy(uint256 indexed policyId, address indexed policyholder);
    event GarageCapNhatQuyen(address indexed garage, bool status);

    // ═══════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════

    modifier onlyPolicyholder(uint256 _policyId) {
        require(policies[_policyId].policyholder == msg.sender, "Khong phai chu hop dong");
        _;
    }

    modifier validPolicy(uint256 _policyId) {
        require(_policyId > 0 && _policyId <= _policyIdCounter, "ID hop dong khong hop le");
        require(policies[_policyId].status == PolicyStatus.ACTIVE, "Hop dong khong con hieu luc");
        _;
    }

    // ═══════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════

    constructor() Ownable(msg.sender) {}

    // ═══════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════

    /**
     * @dev Kiểm tra chuỗi không rỗng
     */
    function _notEmpty(string calldata s) internal pure returns (bool) {
        return bytes(s).length > 0;
    }

    // ═══════════════════════════════════════════
    // PHÍ & MỨC BỒI THƯỜNG
    // ═══════════════════════════════════════════

    /**
     * @notice Tính phí bảo hiểm theo loại xe, loại bảo hiểm và hình thức thanh toán
     * @param _bienSo Biển số xe (cần thiết để lấy giaTriXe khi tính VAT_CHAT_XE)
     * @param _type Loại bảo hiểm
     * @param _pt Hình thức thanh toán
     * @return Số tiền phí bảo hiểm (wei)
     */
    function tinhPhiBaoHiem(
        string calldata _bienSo,
        InsuranceType _type,
        PaymentType _pt
    ) external view returns (uint256) {
        return _tinhPhiBaoHiem(_bienSo, _type, _pt);
    }

    function _tinhPhiBaoHiem(
        string memory _bienSo,
        InsuranceType _type,
        PaymentType _pt
    ) internal view returns (uint256) {
        if (_type == InsuranceType.TNDS_BAT_BUOC) {
            VehicleType loaiXe = vehicles[_bienSo].loaiXe;
            if (loaiXe == VehicleType.XE_MAY) {
                return _pt == PaymentType.ONE_TIME ? 0.001 ether : 0.0001 ether;
            } else if (loaiXe == VehicleType.O_TO_CON) {
                return _pt == PaymentType.ONE_TIME ? 0.005 ether : 0.0005 ether;
            } else if (loaiXe == VehicleType.O_TO_KINH_DOANH) {
                return _pt == PaymentType.ONE_TIME ? 0.01 ether : 0.001 ether;
            } else {
                // XE_TAI
                return _pt == PaymentType.ONE_TIME ? 0.015 ether : 0.0015 ether;
            }
        } else if (_type == InsuranceType.VAT_CHAT_XE) {
            uint256 giaTriXe = vehicles[_bienSo].giaTriXe;
            require(giaTriXe > 0, "Gia tri xe chua duoc khai bao");
            // 1.5% gia tri xe / nam
            uint256 annual = giaTriXe * 15 / 1000;
            return _pt == PaymentType.ONE_TIME ? annual : annual / 12;
        } else if (_type == InsuranceType.NGUOI_TREN_XE) {
            return _pt == PaymentType.ONE_TIME ? 0.002 ether : 0.0002 ether;
        } else {
            // TAI_NAN_LAI_XE
            return _pt == PaymentType.ONE_TIME ? 0.001 ether : 0.0001 ether;
        }
    }

    /**
     * @notice Tính mức bồi thường tối đa theo loại bảo hiểm và loại xe
     * @param _bienSo Biển số xe
     * @param _type Loại bảo hiểm
     * @return Mức bồi thường tối đa (wei)
     */
    function tinhMucBoiThuong(
        string calldata _bienSo,
        InsuranceType _type
    ) external view returns (uint256) {
        return _tinhMucBoiThuong(_bienSo, _type);
    }

    function _tinhMucBoiThuong(
        string memory _bienSo,
        InsuranceType _type
    ) internal view returns (uint256) {
        if (_type == InsuranceType.TNDS_BAT_BUOC) {
            VehicleType loaiXe = vehicles[_bienSo].loaiXe;
            // Xe máy: 0.5 eth tài sản + 1.5 eth người = 2.0 eth
            // Ô tô/xe tải: 1.0 eth tài sản + 1.5 eth người = 2.5 eth
            if (loaiXe == VehicleType.XE_MAY) {
                return 2.0 ether;
            } else {
                return 2.5 ether;
            }
        } else if (_type == InsuranceType.VAT_CHAT_XE) {
            return vehicles[_bienSo].giaTriXe;
        } else if (_type == InsuranceType.NGUOI_TREN_XE) {
            // 0.5 eth/người, tối đa 5 người
            return 2.5 ether;
        } else {
            // TAI_NAN_LAI_XE: 0.3 eth/người
            return 0.3 ether;
        }
    }

    // ═══════════════════════════════════════════
    // 1. ĐĂNG KÝ XE
    // ═══════════════════════════════════════════

    /**
     * @notice Đăng ký xe cơ giới lên blockchain
     * @param _bienSo Biển số xe (unique)
     * @param _loaiXe Loại xe
     * @param _namSanXuat Năm sản xuất (1900-2029)
     * @param _giaTriXe Giá trị xe tính bằng wei (để tính phí VAT_CHAT_XE)
     * @param _ipfsMetadata IPFS CID chứa ảnh xe và giấy tờ
     */
    function dangKyXe(
        string calldata _bienSo,
        VehicleType _loaiXe,
        uint16 _namSanXuat,
        uint256 _giaTriXe,
        string calldata _ipfsMetadata
    ) external whenNotPaused {
        require(_notEmpty(_bienSo), "Bien so khong duoc trong");
        require(!vehicles[_bienSo].isRegistered, "Xe da duoc dang ky");
        require(_namSanXuat > 1900 && _namSanXuat < 2100, "Nam san xuat khong hop le");
        if (_loaiXe != VehicleType.XE_MAY) {
            require(_giaTriXe > 0, "O to/xe tai phai khai bao gia tri xe");
        }

        vehicles[_bienSo] = Vehicle({
            bienSo: _bienSo,
            loaiXe: _loaiXe,
            namSanXuat: _namSanXuat,
            giaTriXe: _giaTriXe,
            chuSoHuu: msg.sender,
            isRegistered: true,
            ipfsMetadata: _ipfsMetadata
        });

        userVehicles[msg.sender].push(_bienSo);

        emit XeDaDangKy(_bienSo, msg.sender, _loaiXe);
    }

    // ═══════════════════════════════════════════
    // 2. MUA BẢO HIỂM
    // ═══════════════════════════════════════════

    /**
     * @notice Mua hợp đồng bảo hiểm cho xe đã đăng ký
     * @param _bienSo Biển số xe
     * @param _insuranceType Loại bảo hiểm
     * @param _paymentType Hình thức thanh toán
     * @param _ipfsMetadata IPFS CID file hợp đồng
     */
    function muaBaoHiem(
        string calldata _bienSo,
        InsuranceType _insuranceType,
        PaymentType _paymentType,
        string calldata _ipfsMetadata
    ) external payable nonReentrant whenNotPaused {
        require(_notEmpty(_bienSo), "Bien so khong duoc trong");
        require(vehicles[_bienSo].isRegistered, "Xe chua duoc dang ky");
        require(vehicles[_bienSo].chuSoHuu == msg.sender, "Ban khong phai chu xe");

        // Kiểm tra chưa có hợp đồng loại đó còn ACTIVE cho xe này
        uint256[] memory vPolicies = vehiclePolicies[_bienSo];
        for (uint256 i = 0; i < vPolicies.length; i++) {
            Policy storage p = policies[vPolicies[i]];
            if (
                p.insuranceType == _insuranceType &&
                p.status == PolicyStatus.ACTIVE &&
                block.timestamp <= p.endDate
            ) {
                revert("Da co hop dong loai nay con hieu luc");
            }
        }

        uint256 requiredPremium = _tinhPhiBaoHiem(_bienSo, _insuranceType, _paymentType);
        require(msg.value >= requiredPremium, "So tien gui vao khong du phi");

        uint256 coverageAmount = _tinhMucBoiThuong(_bienSo, _insuranceType);

        uint256 duration = _paymentType == PaymentType.ONE_TIME ? 365 days : 30 days;

        _policyIdCounter++;
        uint256 newPolicyId = _policyIdCounter;

        policies[newPolicyId] = Policy({
            policyId: newPolicyId,
            vehicleBienSo: _bienSo,
            policyholder: msg.sender,
            insuranceType: _insuranceType,
            paymentType: _paymentType,
            status: PolicyStatus.ACTIVE,
            startDate: block.timestamp,
            endDate: block.timestamp + duration,
            lastPaymentDate: block.timestamp,
            premium: requiredPremium,
            coverageAmount: coverageAmount,
            ipfsMetadata: _ipfsMetadata,
            totalPaid: requiredPremium,
            claimsUsed: 0
        });

        userPolicies[msg.sender].push(newPolicyId);
        vehiclePolicies[_bienSo].push(newPolicyId);

        // Hoàn tiền thừa
        if (msg.value > requiredPremium) {
            (bool refundOk, ) = payable(msg.sender).call{value: msg.value - requiredPremium}("");
            require(refundOk, "Hoan tien that bai");
        }

        emit HopDongDaMua(newPolicyId, msg.sender, _bienSo, _insuranceType, requiredPremium);
        emit PhiDaGiaHan(newPolicyId, msg.sender, requiredPremium, block.timestamp);
    }

    // ═══════════════════════════════════════════
    // 3. GIA HẠN HÀNG THÁNG
    // ═══════════════════════════════════════════

    /**
     * @notice Gia hạn phí hàng tháng cho hợp đồng MONTHLY
     * @param _policyId ID hợp đồng
     */
    function giaHanHangThang(uint256 _policyId)
        external
        payable
        nonReentrant
        whenNotPaused
        onlyPolicyholder(_policyId)
    {
        Policy storage policy = policies[_policyId];
        require(policy.paymentType == PaymentType.MONTHLY, "Khong phai hop dong hang thang");
        require(policy.status == PolicyStatus.ACTIVE, "Hop dong khong con hieu luc");
        require(block.timestamp >= policy.endDate - 7 days, "Chua den ky gia han (chi duoc gia han trong vong 7 ngay truoc khi het han)");

        uint256 requiredPremium = _tinhPhiBaoHiem(
            policy.vehicleBienSo,
            policy.insuranceType,
            PaymentType.MONTHLY
        );
        require(msg.value >= requiredPremium, "So tien gui vao khong du phi");

        policy.endDate = block.timestamp + 30 days;
        policy.lastPaymentDate = block.timestamp;
        policy.totalPaid += requiredPremium;

        if (msg.value > requiredPremium) {
            (bool refundOk, ) = payable(msg.sender).call{value: msg.value - requiredPremium}("");
            require(refundOk, "Hoan tien that bai");
        }

        emit PhiDaGiaHan(_policyId, msg.sender, requiredPremium, block.timestamp);
    }

    // ═══════════════════════════════════════════
    // 4. NỘP YÊU CẦU BỒI THƯỜNG
    // ═══════════════════════════════════════════

    /**
     * @notice Nộp yêu cầu bồi thường cho hợp đồng còn hiệu lực
     * @param _policyId ID hợp đồng
     * @param _claimAmount Số tiền yêu cầu bồi thường (wei)
     * @param _ipfsDocuments IPFS CID chứa ảnh tai nạn, biên bản, hóa đơn
     * @param _description Mô tả vụ tai nạn
     */
    function yeuCauBoiThuong(
        uint256 _policyId,
        uint256 _claimAmount,
        string calldata _ipfsDocuments,
        string calldata _description
    ) external nonReentrant whenNotPaused onlyPolicyholder(_policyId) validPolicy(_policyId) {
        require(_claimAmount > 0, "So tien yeu cau phai lon hon 0");
        require(block.timestamp <= policies[_policyId].endDate, "Hop dong da het han");

        Policy storage policy = policies[_policyId];
        uint256 remaining = policy.coverageAmount > policy.claimsUsed
            ? policy.coverageAmount - policy.claimsUsed
            : 0;
        require(_claimAmount <= remaining, "So tien vuot qua muc boi thuong con lai");

        _claimIdCounter++;
        uint256 newClaimId = _claimIdCounter;

        claims[newClaimId] = Claim({
            claimId: newClaimId,
            policyId: _policyId,
            claimant: msg.sender,
            claimAmount: _claimAmount,
            approvedAmount: 0,
            status: ClaimStatus.PENDING,
            submissionDate: block.timestamp,
            processedDate: 0,
            ipfsDocuments: _ipfsDocuments,
            description: _description,
            processedBy: address(0),
            lyDoTuChoi: "",
            tenGarage: ""
        });

        policyClaims[_policyId].push(newClaimId);

        emit YeuCauDaNop(newClaimId, _policyId, msg.sender, _claimAmount);
    }

    // ═══════════════════════════════════════════
    // 5. GARAGE CẬP NHẬT TRẠNG THÁI
    // ═══════════════════════════════════════════

    /**
     * @notice Garage được ủy quyền cập nhật trạng thái giám định
     * @dev Garage chỉ được chuyển: PENDING → DANG_GIAM_DINH hoặc DANG_GIAM_DINH → CHO_HO_SO
     * @param _claimId ID yêu cầu bồi thường
     * @param _newStatus Trạng thái mới
     * @param _tenGarage Tên garage thực hiện giám định
     * @param _lyDo Lý do hoặc ghi chú
     */
    function garageCapNhatTrangThai(
        uint256 _claimId,
        ClaimStatus _newStatus,
        string calldata _tenGarage,
        string calldata _lyDo
    ) external {
        require(
            authorizedGarages[msg.sender] || msg.sender == owner(),
            "Khong co quyen cap nhat"
        );
        require(_claimId > 0 && _claimId <= _claimIdCounter, "ID khieu nai khong hop le");

        Claim storage claim = claims[_claimId];

        if (msg.sender != owner()) {
            // Garage chỉ được chuyển 2 bước đầu
            require(
                (claim.status == ClaimStatus.PENDING && _newStatus == ClaimStatus.DANG_GIAM_DINH) ||
                (claim.status == ClaimStatus.DANG_GIAM_DINH && _newStatus == ClaimStatus.CHO_HO_SO),
                "Garage chi duoc cap nhat buoc giam dinh"
            );
        } else {
            // Owner có thể đẩy thêm lên DANG_THAM_DINH từ CHO_HO_SO
            require(
                (claim.status == ClaimStatus.PENDING && _newStatus == ClaimStatus.DANG_GIAM_DINH) ||
                (claim.status == ClaimStatus.DANG_GIAM_DINH && _newStatus == ClaimStatus.CHO_HO_SO) ||
                (claim.status == ClaimStatus.CHO_HO_SO && _newStatus == ClaimStatus.DANG_THAM_DINH),
                "Chuyen trang thai khong hop le"
            );
        }

        claim.status = _newStatus;
        claim.tenGarage = _tenGarage;
        claim.processedBy = msg.sender;
        if (bytes(_lyDo).length > 0) {
            claim.lyDoTuChoi = _lyDo;
        }

        emit TrangThaiCapNhat(_claimId, _newStatus, msg.sender);
    }

    // ═══════════════════════════════════════════
    // 6. ADMIN XỬ LÝ BỒI THƯỜNG
    // ═══════════════════════════════════════════

    /**
     * @notice Admin duyệt hoặc từ chối yêu cầu bồi thường
     * @dev Chỉ xử lý claim đang ở CHO_HO_SO hoặc DANG_THAM_DINH
     * @param _claimId ID yêu cầu bồi thường
     * @param _isApproved true = duyệt, false = từ chối
     * @param _approvedAmount Số tiền được duyệt (chỉ cần khi _isApproved = true)
     * @param _lyDo Lý do từ chối (chỉ cần khi _isApproved = false)
     */
    function adminXuLyClaim(
        uint256 _claimId,
        bool _isApproved,
        uint256 _approvedAmount,
        string calldata _lyDo
    ) external onlyOwner {
        require(_claimId > 0 && _claimId <= _claimIdCounter, "ID khieu nai khong hop le");

        Claim storage claim = claims[_claimId];
        // Admin chỉ duyệt/từ chối sau khi đã qua giám định garage và nộp đủ hồ sơ
        require(
            claim.status == ClaimStatus.CHO_HO_SO ||
            claim.status == ClaimStatus.DANG_THAM_DINH,
            "Claim phai o buoc CHO_HO_SO hoac DANG_THAM_DINH"
        );

        if (_isApproved) {
            require(_approvedAmount > 0, "So tien duyet phai lon hon 0");
            require(_approvedAmount <= claim.claimAmount, "So tien duyet vuot qua yeu cau");

            Policy storage policy = policies[claim.policyId];
            uint256 remaining = policy.coverageAmount > policy.claimsUsed
                ? policy.coverageAmount - policy.claimsUsed
                : 0;
            require(_approvedAmount <= remaining, "Vuot qua muc boi thuong con lai");

            claim.approvedAmount = _approvedAmount;
            claim.status = ClaimStatus.APPROVED;
        } else {
            claim.status = ClaimStatus.REJECTED;
            claim.lyDoTuChoi = _lyDo;
        }

        claim.processedBy = msg.sender;
        claim.processedDate = block.timestamp;

        emit TrangThaiCapNhat(_claimId, claim.status, msg.sender);
    }

    // ═══════════════════════════════════════════
    // 7. CHI TRẢ BỒI THƯỜNG
    // ═══════════════════════════════════════════

    /**
     * @notice Admin thực hiện chi trả tiền bồi thường cho claim đã duyệt
     * @param _claimId ID yêu cầu bồi thường
     */
    function chiTraBoiThuong(uint256 _claimId)
        external
        onlyOwner
        nonReentrant
    {
        require(_claimId > 0 && _claimId <= _claimIdCounter, "ID khieu nai khong hop le");

        Claim storage claim = claims[_claimId];
        require(claim.status == ClaimStatus.APPROVED, "Claim chua duoc duyet");
        require(claim.approvedAmount > 0, "So tien boi thuong bang 0");
        require(address(this).balance >= claim.approvedAmount, "Hop dong khong du tien");

        Policy storage policy = policies[claim.policyId];
        policy.claimsUsed += claim.approvedAmount;

        claim.status = ClaimStatus.PAID;
        claim.processedDate = block.timestamp;

        address recipient = claim.claimant;
        uint256 amount = claim.approvedAmount;

        (bool ok, ) = payable(recipient).call{value: amount}("");
        require(ok, "Chi tra boi thuong that bai");

        emit BoiThuongDaChiTra(_claimId, amount, recipient);
    }

    // ═══════════════════════════════════════════
    // 8. HỦY HỢP ĐỒNG
    // ═══════════════════════════════════════════

    /**
     * @notice Chủ hợp đồng hủy hợp đồng bảo hiểm đang ACTIVE
     * @param _policyId ID hợp đồng
     */
    function huyHopDong(uint256 _policyId)
        external
        nonReentrant
        whenNotPaused
        onlyPolicyholder(_policyId)
    {
        Policy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.ACTIVE, "Hop dong khong con hieu luc");

        policy.status = PolicyStatus.CANCELLED;

        emit HopDongDaHuy(_policyId, msg.sender);
    }

    // ═══════════════════════════════════════════
    // 9. ADMIN FUNCTIONS
    // ═══════════════════════════════════════════

    /**
     * @notice Cấp hoặc thu hồi quyền giám định của garage
     * @param _garage Địa chỉ ví của garage
     * @param _status true = cấp quyền, false = thu hồi
     */
    function capQuyenGarage(address _garage, bool _status) external onlyOwner {
        require(_garage != address(0), "Dia chi garage khong hop le");
        // Thêm vào danh sách nếu là lần cấp quyền đầu tiên
        if (_status && !authorizedGarages[_garage]) {
            _garageList.push(_garage);
        }
        authorizedGarages[_garage] = _status;
        emit GarageCapNhatQuyen(_garage, _status);
    }

    /**
     * @notice Lấy danh sách tất cả garage đã từng được cấp quyền
     * @return Mảng địa chỉ garage
     */
    function getGarageList() external view returns (address[] memory) {
        return _garageList;
    }

    /**
     * @notice Admin rút tiền từ contract
     * @param _amount Số lượng ETH cần rút (wei)
     */
    function rutTien(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount > 0, "So tien phai lon hon 0");
        require(address(this).balance >= _amount, "So du khong du");
        (bool ok, ) = payable(owner()).call{value: _amount}("");
        require(ok, "Rut tien that bai");
    }

    /**
     * @notice Tạm dừng toàn bộ hoạt động contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Khôi phục hoạt động contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ═══════════════════════════════════════════
    // 10. VIEW FUNCTIONS
    // ═══════════════════════════════════════════

    /**
     * @notice Lấy danh sách ID hợp đồng của người dùng
     * @param _user Địa chỉ người dùng
     * @return Mảng ID hợp đồng
     */
    function getUserPolicies(address _user) external view returns (uint256[] memory) {
        return userPolicies[_user];
    }

    /**
     * @notice Lấy danh sách ID claim của hợp đồng
     * @param _policyId ID hợp đồng
     * @return Mảng ID claim
     */
    function getPolicyClaims(uint256 _policyId) external view returns (uint256[] memory) {
        return policyClaims[_policyId];
    }

    /**
     * @notice Kiểm tra hợp đồng có còn hiệu lực không
     * @param _policyId ID hợp đồng
     * @return true nếu ACTIVE và chưa hết hạn
     */
    function isPolicyValid(uint256 _policyId) external view returns (bool) {
        if (_policyId == 0 || _policyId > _policyIdCounter) return false;
        Policy memory policy = policies[_policyId];
        return policy.status == PolicyStatus.ACTIVE && block.timestamp <= policy.endDate;
    }

    /**
     * @notice Lấy mức bồi thường còn lại của hợp đồng
     * @param _policyId ID hợp đồng
     * @return Số tiền bồi thường còn lại (wei)
     */
    function getRemainingCoverage(uint256 _policyId) external view returns (uint256) {
        Policy memory policy = policies[_policyId];
        return policy.coverageAmount > policy.claimsUsed
            ? policy.coverageAmount - policy.claimsUsed
            : 0;
    }

    /**
     * @notice Lấy số dư ETH trong contract
     * @return Số dư (wei)
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Lấy tổng số hợp đồng đã tạo
     * @return Tổng số hợp đồng
     */
    function getTotalPolicies() external view returns (uint256) {
        return _policyIdCounter;
    }

    /**
     * @notice Lấy tổng số yêu cầu bồi thường đã nộp
     * @return Tổng số claim
     */
    function getTotalClaims() external view returns (uint256) {
        return _claimIdCounter;
    }

    /**
     * @notice Lấy thông tin xe theo biển số
     * @param _bienSo Biển số xe
     * @return Struct Vehicle
     */
    function getVehicle(string calldata _bienSo) external view returns (Vehicle memory) {
        require(vehicles[_bienSo].isRegistered, "Xe chua duoc dang ky");
        return vehicles[_bienSo];
    }

    /**
     * @notice Lấy danh sách biển số xe của người dùng
     * @param _user Địa chỉ người dùng
     * @return Mảng biển số xe
     */
    function getUserVehicles(address _user) external view returns (string[] memory) {
        return userVehicles[_user];
    }

    /**
     * @notice Lấy danh sách ID hợp đồng theo biển số xe
     * @param _bienSo Biển số xe
     * @return Mảng ID hợp đồng
     */
    function getVehiclePolicies(string calldata _bienSo) external view returns (uint256[] memory) {
        return vehiclePolicies[_bienSo];
    }

    // ═══════════════════════════════════════════
    // RECEIVE
    // ═══════════════════════════════════════════

    receive() external payable {}
}