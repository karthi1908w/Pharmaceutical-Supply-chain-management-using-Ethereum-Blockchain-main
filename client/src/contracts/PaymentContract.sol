// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentContract {
    address public distributor;

    // Mapping to store the balance of each customer
    mapping(address => uint256) public balances;

    // Event emitted when a customer makes a payment
    event PaymentReceived(address customer, uint256 amount);

    // Constructor sets the distributor address
    constructor(address _distributor) {
        distributor = _distributor;
    }

    // Function to allow customers to send payment
    function pay(uint256 amount) public payable {
        require(msg.value == amount, "Incorrect amount sent");

        // Update the balance of the customer
        balances[msg.sender] += msg.value;

        // Emit event
        emit PaymentReceived(msg.sender, msg.value);

        // Transfer payment to the distributor
        payable(distributor).transfer(amount);
    }

    // Function to check the contract balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
