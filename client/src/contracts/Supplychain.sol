// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentContract {
    address public manufacturer;

    struct Payment {
        address distributor;
        uint256 amount;
        uint256 timestamp;
        string transactionHash;
    }

    Payment[] public paymentHistory;

    event PaymentReceived(address indexed distributor, uint256 amount, string transactionHash);

    constructor(address _manufacturer) {
        manufacturer = _manufacturer;
    }

    function makePayment(string memory txHash) public payable {
        require(msg.value > 0, "Payment must be greater than zero");

        paymentHistory.push(Payment({
            distributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            transactionHash: txHash
        }));

        emit PaymentReceived(msg.sender, msg.value, txHash);
    }

    function getPaymentHistory() public view returns (Payment[] memory) {
        return paymentHistory;
    }

    function withdrawFunds() public {
        require(msg.sender == manufacturer, "Only the manufacturer can withdraw funds");
        payable(manufacturer).transfer(address(this).balance);
    }
}
