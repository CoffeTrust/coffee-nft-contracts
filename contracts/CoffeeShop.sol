// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICoffeeShop} from "./interfaces/ICoffeeShop.sol";

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {Roles, Error} from "./Constants.sol";

contract CoffeeShop is ERC721, ICoffeeShop {
    using Counters for Counters.Counter;
    Counters.Counter private coffeeId;

    using ECDSA for bytes32;
    using SafeERC20 for IERC20;
    IERC20 public RubC;

    constructor(address admin, address _rubc) ERC721("CoffeeShop", "COFFEE") {
        _admins[admin] = true;
        RubC = IERC20(_rubc);
    }

    event CoffeeHouseSet(address indexed barista, address indexed owner);
    event CoffeeMinted(address indexed client, uint256 indexed id);
    event CoffeeBurned(address indexed owner, uint256 indexed product);

    mapping(address => bool) internal _admins;
    mapping(address => bool) internal _coffeeHouse;

    //Menue
    uint8 public milkLength;
    mapping(uint8 => Milk) internal milkTypes;

    uint8 public syrupLength;
    mapping(uint8 => Syrup) internal syrupTypes;

    uint8 public powderLength;
    mapping(uint8 => Powder) internal powderTypes;

    uint8 public sizeLength;
    mapping(uint8 => Size) internal sizeTypes;

    uint8 public baseLength;
    mapping(uint8 => Base) internal baseTypes;

    mapping(address => uint256[]) internal usersCoffee;
    mapping(uint256 => CoffeeProduct) internal coffeeProducts;

    mapping(uint8 => AllowedComponents) internal _baseAllowedComponents;

    //Coffee House
    mapping(address => address) internal costRecipient;

    function setCoffeeHouse(address barista, address owner) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);

        _coffeeHouse[barista] = true;
        costRecipient[barista] = owner;
        emit CoffeeHouseSet(barista, owner);
    }

    function revokeCoffeeHouse(address barista) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);

        _coffeeHouse[barista] = false;
        delete costRecipient[barista];
    }

    function mintCoffee(MintArgs memory product) external {
        uint256 toPay;

        AllowedComponents memory allowedComponents = _baseAllowedComponents[
            product.base
        ];

        for (uint256 i; i < allowedComponents.sizes.length; i++) {
            if (product.size == allowedComponents.sizes[i]) {
                break;
            }
            if (i == allowedComponents.sizes.length - 1) {
                revert(Error.PRODUCT_NOT_ALLOWED);
            }
        }

        for (uint256 i; i < allowedComponents.milks.length; i++) {
            if (product.milk == allowedComponents.milks[i]) {
                break;
            }
            if (i == allowedComponents.milks.length - 1) {
                revert(Error.PRODUCT_NOT_ALLOWED);
            }
        }

        for (uint256 i; i < allowedComponents.syrups.length; i++) {
            if (product.syrup == allowedComponents.syrups[i]) {
                break;
            }
            if (i == allowedComponents.syrups.length - 1) {
                revert(Error.PRODUCT_NOT_ALLOWED);
            }
        }

        for (uint256 i = 0; i < allowedComponents.powders.length; i++) {
            if (product.powder == allowedComponents.powders[i]) {
                break;
            }
            if (i == allowedComponents.powders.length - 1) {
                revert(Error.PRODUCT_NOT_ALLOWED);
            }
        }

        uint256 id = coffeeId.current();

        coffeeProducts[id] = CoffeeProduct(
            true,
            sizeTypes[product.size],
            baseTypes[product.base],
            milkTypes[product.milk],
            syrupTypes[product.syrup],
            powderTypes[product.powder],
            0
        );

        CoffeeProduct storage _coffee = coffeeProducts[id];

        _coffee.cost =
            _coffee.size.price +
            _coffee.base.price +
            _coffee.syrup.price +
            _coffee.powder.price;

        toPay += _coffee.cost;

        usersCoffee[msg.sender].push(id);

        _safeMint(msg.sender, id);

        coffeeId.increment();
        emit CoffeeMinted(msg.sender, id);
        RubC.safeTransferFrom(msg.sender, address(this), toPay);
    }

    function burnCoffee(uint256 product, bytes memory signature) external {
        require(_coffeeHouse[msg.sender], Error.NOT_COFFEE_HOUSE);

        address owner;
        uint256 toPay;

        owner = checkOwner(product, signature);

        uint256[] storage userCoffee = usersCoffee[owner];

        for (uint256 j = 0; j < userCoffee.length; j++) {
            if (userCoffee[j] == product) {
                userCoffee[j] = userCoffee[userCoffee.length - 1];
                userCoffee.pop();
                break;
            }
        }

        toPay += coffeeProducts[product].cost;
        delete coffeeProducts[product];

        _burn(product);
        emit CoffeeBurned(owner, product);

        //Send to coffee house
        RubC.safeTransfer(costRecipient[msg.sender], toPay);
    }

    // SETTER

    function getAllowedBaseComponents(
        uint8 _base
    ) external view returns (AllowedComponents memory) {
        return _baseAllowedComponents[_base];
    }

    function setAllowedProduct(
        uint8 base,
        AllowedComponents memory components
    ) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        _baseAllowedComponents[base] = components;
    }

    function addMilk(Milk memory _milk) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        milkTypes[milkLength] = _milk;
        milkLength++;
    }

    function revokeMilk(uint8 _indexMilk) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        milkTypes[_indexMilk] = milkTypes[milkLength - 1];
        delete milkTypes[milkLength - 1];
        milkLength--;
    }

    function addSyrup(Syrup memory _syrup) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        syrupTypes[syrupLength] = _syrup;
        syrupLength++;
    }

    function revokeSyrup(uint8 _indexSyrup) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        syrupTypes[_indexSyrup] = syrupTypes[syrupLength - 1];
        delete syrupTypes[syrupLength - 1];
        syrupLength--;
    }

    function addPowder(Powder memory _powder) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        powderTypes[powderLength] = _powder;
        powderLength++;
    }

    function revokePowder(uint8 _indexPowder) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        powderTypes[_indexPowder] = powderTypes[powderLength - 1];
        delete powderTypes[powderLength - 1];
        powderLength--;
    }

    function addBase(Base memory _base) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        baseTypes[baseLength] = _base;
        baseLength++;
    }

    function revokeBase(uint8 _indexBase) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        baseTypes[_indexBase] = baseTypes[baseLength - 1];
        delete baseTypes[baseLength - 1];
        baseLength--;
    }

    function addSize(Size memory _size) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        sizeTypes[sizeLength] = _size;
        sizeLength++;
    }

    function revokeSize(uint8 _indexSize) external {
        require(_admins[msg.sender], Error.NOT_ADMIN);
        sizeTypes[_indexSize] = sizeTypes[sizeLength - 1];
        delete sizeTypes[sizeLength - 1];
        sizeLength--;
    }

    function transfer(address to, uint256 tokenId) external {
        for (uint256 i = 0; i < usersCoffee[msg.sender].length; i++) {
            if (usersCoffee[msg.sender][i] == tokenId) {
                usersCoffee[msg.sender][i] = usersCoffee[msg.sender][
                    usersCoffee[msg.sender].length - 1
                ];
                usersCoffee[msg.sender].pop();
                break;
            }
        }
        usersCoffee[to].push(tokenId);
        _safeTransfer(msg.sender, to, tokenId, "");
    }

    function checkOwner(
        uint256 _pid,
        bytes memory _signature
    ) internal view returns (address) {
        address owner = keccak256(abi.encode(_pid))
            .toEthSignedMessageHash()
            .recover(_signature);
        require(ownerOf(_pid) == owner, Error.WRONG_OWNER);
        return owner;
    }

    //Getters
    function getMilkType(uint8 index) external view returns (Milk memory) {
        return milkTypes[index];
    }

    function getSyrupType(uint8 index) external view returns (Syrup memory) {
        return syrupTypes[index];
    }

    function getPowderType(uint8 index) external view returns (Powder memory) {
        return powderTypes[index];
    }

    function getSizeType(uint8 index) external view returns (Size memory) {
        return sizeTypes[index];
    }

    function getBaseType(uint8 index) external view returns (Base memory) {
        return baseTypes[index];
    }

    function getUsersCoffee(
        address user
    ) external view returns (uint256[] memory) {
        return usersCoffee[user];
    }

    function getCoffeeProduct(
        uint256 tokenId
    ) external view returns (CoffeeProduct memory) {
        return coffeeProducts[tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function exists(uint256 _id) external view returns (bool) {
        return _exists(_id);
    }
}
