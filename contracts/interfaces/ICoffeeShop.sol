// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ICoffeeShop {
    struct Size {
        bool exists;
        string name;
        uint256 price;
        string[3] image;
    }

    struct Milk {
        bool exists;
        string name;
        string[3] image;
    }

    struct Syrup {
        bool exists;
        string name;
        string[3] image;
        uint256 price;
    }

    struct Powder {
        bool exists;
        string name;
        string[3] image;
        uint256 price;
    }

    struct Base {
        uint8 defaultSize;
        bool exists;
        uint256 price;
        string name;
        string[2] image;
    }

    struct CoffeeProduct {
        bool exists;
        Size size;
        Base base;
        Milk milk;
        Syrup syrup;
        Powder powder;
        uint256 cost;
    }

    struct MintArgs {
        uint8 base;
        uint8 size;
        uint8 milk;
        uint8 syrup;
        uint8 powder;
    }

    struct AllowedComponents {
        uint8[] sizes;
        uint8[] milks;
        uint8[] syrups;
        uint8[] powders;
    }

    function milkLength() external view returns (uint8);

    function syrupLength() external view returns (uint8);

    function powderLength() external view returns (uint8);

    function sizeLength() external view returns (uint8);

    function baseLength() external view returns (uint8);

    //Menue

    //Getters
    function getMilkType(uint8 index) external view returns (Milk memory);

    function getSyrupType(uint8 index) external view returns (Syrup memory);

    function getPowderType(uint8 index) external view returns (Powder memory);

    function getSizeType(uint8 index) external view returns (Size memory);

    function getBaseType(uint8 index) external view returns (Base memory);

    function getUsersCoffee(
        address user
    ) external view returns (uint256[] memory);

    function getCoffeeProduct(
        uint256 tokenId
    ) external view returns (CoffeeProduct memory);

    function exists(uint256 _key) external view returns (bool);
}
