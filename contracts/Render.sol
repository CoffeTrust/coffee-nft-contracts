// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ICoffeeShop} from "./interfaces/ICoffeeShop.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Error} from "./Constants.sol";

contract Render {
    ICoffeeShop coffeShop;

    using Strings for uint256;
    using Strings for uint8;

    constructor(address _coffeShop) {
        coffeShop = ICoffeeShop(_coffeShop);
    }

    function getGlass(uint8 _size) external view returns (string memory) {
        ICoffeeShop.Size memory size = coffeShop.getSizeType(_size);

        return
            string(
                abi.encodePacked(
                    '{"image": "',
                    abi.encodePacked(
                        size.image[0],
                        size.image[1],
                        size.image[2]
                    ),
                    '", "name":"',
                    size.name,
                    '", "price":"',
                    size.price.toString(),
                    '"}'
                )
            );
    }

    function getBase(uint8 baseId) external view returns (string memory) {
        ICoffeeShop.Base memory _base = coffeShop.getBaseType(baseId);

        require(_base.exists, Error.BASE_NOT_FOUND);

        ICoffeeShop.Size memory _size = coffeShop.getSizeType(
            _base.defaultSize
        );

        return
            string(
                abi.encodePacked(
                    '{"image": "',
                    abi.encodePacked(
                        _size.image[0],
                        _base.image[0],
                        _base.image[1],
                        _size.image[2]
                    ),
                    '", "name":"',
                    _base.name,
                    '", "defaultSize":',
                    _base.defaultSize.toString(),
                    ', "price":"',
                    (_base.price + _size.price).toString(),
                    '"}'
                )
            );
    }

    function getStockMilk(uint8 milkId) external view returns (string memory) {
        ICoffeeShop.Milk memory _milk = coffeShop.getMilkType(milkId);

        require(_milk.exists, Error.MILK_NOT_FOUND);

        string[3] memory images = _milk.image;

        return
            string(
                abi.encodePacked(
                    '{"image":"',
                    images[0],
                    images[1],
                    images[2],
                    '", "name":"',
                    _milk.name,
                    '"}'
                )
            );
    }

    function getStockSyrup(
        uint8 syrupId
    ) external view returns (string memory) {
        ICoffeeShop.Syrup memory _syrup = coffeShop.getSyrupType(syrupId);

        require(_syrup.exists, Error.SYRUP_NOT_FOUND);

        string[3] memory images = _syrup.image;

        return
            string(
                abi.encodePacked(
                    '{"image":"',
                    images[0],
                    images[1],
                    images[2],
                    '", "name": "',
                    _syrup.name,
                    '", "price":"',
                    Strings.toString(_syrup.price),
                    '"}'
                )
            );
    }

    function getStockPowder(
        uint8 powderId
    ) external view returns (string memory) {
        ICoffeeShop.Powder memory _powder = coffeShop.getPowderType(powderId);

        require(_powder.exists, Error.POWDER_NOT_FOUND);

        string[3] memory images = _powder.image;

        return
            string(
                abi.encodePacked(
                    '{"image":"',
                    images[0],
                    images[1],
                    images[2],
                    '", "name":"',
                    _powder.name,
                    '", "price":"',
                    Strings.toString(_powder.price),
                    '"}'
                )
            );
    }

    function getProduct(uint256 tokenId) external view returns (string memory) {
        ICoffeeShop.CoffeeProduct memory _coffee = coffeShop.getCoffeeProduct(
            tokenId
        );

        if (!_coffee.exists) return "";

        return
            string(
                abi.encodePacked(
                    '{"sizeName":"',
                    _coffee.size.name,
                    '","baseName":"',
                    _coffee.base.name,
                    '", "image":"',
                    _packProductImage(_coffee),
                    '", "milkName":"',
                    _coffee.milk.name,
                    '", "milkImage":"',
                    _packMilkImage(_coffee),
                    '", "syrupName":"',
                    _coffee.syrup.name,
                    '", "syrupImage":"',
                    _packSyrupImage(_coffee),
                    '", "powderName":"',
                    _coffee.powder.name,
                    '", "powderImage":"',
                    _packPowderImage(_coffee),
                    '", "cost":"',
                    Strings.toString(_coffee.cost),
                    '"}'
                )
            );
    }

    function _packProductImage(
        ICoffeeShop.CoffeeProduct memory _coffee
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    _coffee.size.image[0],
                    _coffee.base.image[0],
                    _coffee.milk.image[1],
                    _coffee.syrup.image[1],
                    _coffee.powder.image[1],
                    _coffee.size.image[2]
                )
            );
    }

    function _packMilkImage(
        ICoffeeShop.CoffeeProduct memory _coffee
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    _coffee.milk.image[0],
                    _coffee.milk.image[1],
                    _coffee.milk.image[2]
                )
            );
    }

    function _packSyrupImage(
        ICoffeeShop.CoffeeProduct memory _coffee
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    _coffee.syrup.image[0],
                    _coffee.syrup.image[1],
                    _coffee.syrup.image[2]
                )
            );
    }

    function _packPowderImage(
        ICoffeeShop.CoffeeProduct memory _coffee
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    _coffee.powder.image[0],
                    _coffee.powder.image[1],
                    _coffee.powder.image[2]
                )
            );
    }
}
