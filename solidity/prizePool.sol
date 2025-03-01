// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PrizePool {
    address public owner;
    mapping(address => uint256) public contributions;
    uint256 public totalPool;

    event Deposited(address indexed sender, uint256 amount);
    event Withdrawn(address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Function to deposit funds
    function deposit() external payable {
        require(msg.value > 0, "Must send some Ether");
        contributions[msg.sender] += msg.value;
        totalPool += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    // Owner-only function to withdraw funds to a specific address
    function withdraw(address payable _recipient) external onlyOwner {
        require(totalPool > 0, "No funds available");

        uint256 amount = totalPool;
        totalPool = 0;
        
        (bool success, ) = _recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(_recipient, amount);
    }

    // Fallback function to accept ETH and record contributions
    receive() external payable {
        require(msg.value > 0, "Must send some Ether");
        contributions[msg.sender] += msg.value;
        totalPool += msg.value;

        emit Deposited(msg.sender, msg.value);
    }
}
