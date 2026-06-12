// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../VehicleInsuranceDApp.sol";

/// @dev Mock dùng trong unit test: cố gắng reentrancy vào muaBaoHiem qua refund tiền thừa
contract ReentrancyAttacker {
    VehicleInsuranceDApp public target;
    bool public attackOnReceive;

    constructor(address payable _target) {
        target = VehicleInsuranceDApp(_target);
    }

    function registerVehicle(string calldata _bienSo) external {
        target.dangKyXe(_bienSo, VehicleInsuranceDApp.VehicleType.XE_MAY, 2020, 0, "cid-test");
    }

    /// @dev Gửi thừa tiền để contract hoàn lại -> receive() cố re-enter muaBaoHiem
    function buyWithExcess(string calldata _bienSo) external payable {
        attackOnReceive = true;
        target.muaBaoHiem{value: msg.value}(
            _bienSo,
            VehicleInsuranceDApp.InsuranceType.TNDS_BAT_BUOC,
            VehicleInsuranceDApp.PaymentType.ONE_TIME,
            "cid-test"
        );
    }

    receive() external payable {
        if (attackOnReceive) {
            attackOnReceive = false;
            // Re-enter: nếu không có ReentrancyGuard thì call này sẽ được xử lý
            target.muaBaoHiem{value: msg.value}(
                "ATTACK-XE-2",
                VehicleInsuranceDApp.InsuranceType.TNDS_BAT_BUOC,
                VehicleInsuranceDApp.PaymentType.ONE_TIME,
                "cid-test"
            );
        }
    }
}
