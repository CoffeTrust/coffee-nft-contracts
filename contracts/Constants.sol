// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library Roles {
    bytes32 public constant ADMIN =
        bytes32(
            0xb055000000000000000000000000000000000000000000000000000000000000
        ); // Admin

    bytes32 public constant COFFEE_HOUSE =
        bytes32(
            0xc044ee0000000000000000000000000000000000000000000000000000000000
        ); // Coffee house
}

library Error {
    string public constant BASE_NOT_FOUND = "404";
    string public constant MILK_NOT_FOUND = "414";
    string public constant SYRUP_NOT_FOUND = "424";
    string public constant POWDER_NOT_FOUND = "434";
    string public constant COFFEE_NOT_FOUND = "444";
    string public constant WRONG_OWNER = "454";
    string public constant PRODUCT_NOT_ALLOWED = "464";
    string public constant NOT_ADMIN = "474";
    string public constant NOT_COFFEE_HOUSE = "484";
}
