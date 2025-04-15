// Payment.sol
pragma solidity ^0.8.0;

contract Payment {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);  // Set the contract deployer as the owner
    }

    // Function to accept payments
    function makePayment() public payable {
        require(msg.value > 0, "Payment should be greater than zero");
        owner.transfer(msg.value);  // Transfer the funds to the owner
    }

    // Function to get contract balance
    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
}
