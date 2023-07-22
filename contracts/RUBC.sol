// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract RubleCoin is ERC20, ERC20Burnable {
    constructor() ERC20("RubleCoin", "RUBC") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function mintTo(address account, uint256 amount) external {
        _mint(account, amount);
    }
}
