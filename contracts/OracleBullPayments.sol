// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OracleBullPayments {
    address public owner;
    mapping(address => bool) public hasPaid;

    event PaymentReceived(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = 0x38e2F47D9b2Eb233c035Dcbc2D40857D9517933A; // OracleBull default recipient
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function pay() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        hasPaid[msg.sender] = true;
        emit PaymentReceived(msg.sender, msg.value);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdraw failed");
        
        emit FundsWithdrawn(owner, balance);
    }
}
