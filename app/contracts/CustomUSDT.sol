// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomUSDT is ERC20, Ownable {
    constructor() ERC20("Custom USDT", "cUSDT") Ownable(msg.sender) {
        _mint(msg.sender, 10000000 * 10**decimals()); // Mint 10 million tokens
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
} 