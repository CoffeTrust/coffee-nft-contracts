import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployTesting, getACErrorText } from "../scripts/util";
import { ICoffeeShop, MockERC20 } from "../typechain-types";
import { Protocol } from "../scripts/types";
import { Roles } from "../scripts/constants";
import { BigNumber } from "ethers";
import { defaultAbiCoder, arrayify, keccak256 } from "ethers/lib/utils";
import hre from "hardhat";

describe("CoffeeShop", () => {
    let owner: SignerWithAddress;
    let userA: SignerWithAddress;
    let userB: SignerWithAddress;

    let p: Protocol;

    beforeEach(async () => {
        [owner, userA, userB] = await ethers.getSigners();

        p = await deployTesting(owner, hre);
    });

    it("setCoffeeHouse()", async () => {
        await expect(
            p.shop.connect(userA).setCoffeeHouse(userB.address, userA.address)
        ).to.be.revertedWith(getACErrorText(userA.address, Roles.ADMIN));

        await p.shop.setCoffeeHouse(userA.address, owner.address);
    });

    it("revokeCoffeeHouse()", async () => {
        await p.shop.setCoffeeHouse(userA.address, owner.address);

        await expect(
            p.shop.connect(userA).revokeCoffeeHouse(userA.address)
        ).to.be.revertedWith(getACErrorText(userA.address, Roles.ADMIN));

        await p.shop.connect(owner).revokeCoffeeHouse(userA.address);

        expect(await p.shop.hasRole(Roles.COFFEE_HOUSE, userA.address)).false;
    });

    it("addMilks()", async () => {
        const testMilk: ICoffeeShop.MilkStruct[] = [
            {
                exists: true,
                name: "testMilk",
                image: ["testMilk1", "testMilk2", "testMilk3"]
            }
        ];

        await expect(
            p.shop.connect(userA).addMilk(testMilk)
        ).to.be.revertedWith(getACErrorText(userA.address, Roles.ADMIN));

        await p.shop.addMilk(testMilk);

        expect(await p.shop.getMilkTypes(0)).to.deep.equal(
            Object.values(testMilk[0])
        );
    });

    it("addSyrup()", async () => {
        const testSyrup: ICoffeeShop.SyrupStruct[] = [
            {
                exists: true,
                name: "testSyrup",
                image: ["testSyrup", "testSyrup", "testSyrup"],
                price: 50
            }
        ];

        await expect(
            p.shop.connect(userA).addSyrup(testSyrup)
        ).to.be.revertedWith(getACErrorText(userA.address, Roles.ADMIN));

        await p.shop.addSyrup(testSyrup);

        expect(await p.shop.getSyrupTypes(0)).to.deep.equal(
            Object.values(testSyrup[0])
        );
    });

    it("addPowder()", async () => {
        const testPowder: ICoffeeShop.PowderStruct[] = [
            {
                exists: true,
                name: "testPowder",
                image: ["testPowder", "testPowder", "testPowder"],
                price: 50
            }
        ];

        await expect(
            p.shop.connect(userA).addPowder(testPowder)
        ).to.be.revertedWith(getACErrorText(userA.address, Roles.ADMIN));

        await p.shop.addPowder(testPowder);

        expect(await p.shop.getPowderTypes(0)).to.deep.equal(
            Object.values(testPowder[0])
        );
    });

    it("addBase()", async () => {
        const testBase: ICoffeeShop.BaseStruct[] = [
            {
                exists: true,
                size: 1,
                price: 200,
                name: "testBase",
                image: ["testBase", "testBase"]
            }
        ];

        await expect(
            p.shop.connect(userA).addBase(testBase)
        ).to.be.revertedWith(getACErrorText(userA.address, Roles.ADMIN));

        await p.shop.addBase(testBase);

        expect(await p.shop.getBaseTypes(0)).to.deep.equal(
            Object.values(testBase[0])
        );
    });

    it("addSize()", async () => {
        const size: string = "Средний";
        await expect(p.shop.connect(userA).addSize(size)).to.be.revertedWith(
            getACErrorText(userA.address, Roles.ADMIN)
        );

        await p.shop.addSize(size);

        expect(await p.shop.getSizeTypes(0)).to.deep.equal(size);
    });

    it("setAllowedProduct()", async () => {
        const bases: Array<number> = [1, 2, 3];
        const milks: Array<number> = [2, 4, 3];
        const syrups: Array<number> = [12, 2, 6];
        const powders: Array<number> = [16, 6, 5];

        await expect(
            p.shop
                .connect(userA)
                .setAllowedProduct(bases, milks, syrups, powders)
        ).to.be.revertedWith(getACErrorText(userA.address, Roles.ADMIN));

        await p.shop.setAllowedProduct(bases, milks, syrups, powders);

        expect(await p.shop.isAllowedProduct(1, 2, 12, 16)).to.deep.equal(true);
        expect(await p.shop.isAllowedProduct(1, 2, 30, 16)).to.deep.equal(
            false
        );
    });

    it("revokeMilk()", async () => {
        const testMilk: ICoffeeShop.MilkStruct[] = [
            {
                exists: true,
                name: "testMilk",
                image: ["testMilk1", "testMilk2", "testMilk3"]
            }
        ];

        const emptyMilk: ICoffeeShop.MilkStruct[] = [
            {
                exists: false,
                name: "",
                image: ["", "", ""]
            }
        ];

        await p.shop.addMilk(testMilk);
        expect(await p.shop.getMilkTypes(0)).to.deep.equal(
            Object.values(testMilk[0])
        );
        await expect(p.shop.connect(userA).revokeMilk(0)).to.be.revertedWith(
            getACErrorText(userA.address, Roles.ADMIN)
        );

        await p.shop.revokeMilk(0);

        expect(await p.shop.getMilkTypes(0)).to.deep.equal(
            Object.values(emptyMilk[0])
        );
    });

    it("revokeSyrup()", async () => {
        const testSyrup: ICoffeeShop.SyrupStruct[] = [
            {
                exists: true,
                name: "testSyrup",
                image: ["testSyrup", "testSyrup", "testSyrup"],
                price: 50
            }
        ];

        const emptySyrup: ICoffeeShop.SyrupStruct[] = [
            {
                exists: false,
                name: "",
                image: ["", "", ""],
                price: 0
            }
        ];

        await p.shop.addSyrup(testSyrup);
        expect(await p.shop.getSyrupTypes(0)).to.deep.equal(
            Object.values(testSyrup[0])
        );
        await expect(p.shop.connect(userA).revokeSyrup(0)).to.be.revertedWith(
            getACErrorText(userA.address, Roles.ADMIN)
        );

        await p.shop.revokeSyrup(0);

        expect(await p.shop.getSyrupTypes(0)).to.deep.equal(
            Object.values(emptySyrup[0])
        );
    });

    it("revokePowder()", async () => {
        const testPowder: ICoffeeShop.PowderStruct[] = [
            {
                exists: true,
                name: "testPowder",
                image: ["testPowder", "testPowder", "testPowder"],
                price: 50
            }
        ];

        const emptyPowder: ICoffeeShop.PowderStruct[] = [
            {
                exists: false,
                name: "",
                image: ["", "", ""],
                price: 0
            }
        ];

        await p.shop.addPowder(testPowder);
        expect(await p.shop.getPowderTypes(0)).to.deep.equal(
            Object.values(testPowder[0])
        );
        await expect(p.shop.connect(userA).revokePowder(0)).to.be.revertedWith(
            getACErrorText(userA.address, Roles.ADMIN)
        );

        await p.shop.revokePowder(0);

        expect(await p.shop.getPowderTypes(0)).to.deep.equal(
            Object.values(emptyPowder[0])
        );
    });

    it("revokeBase()", async () => {
        const testBase: ICoffeeShop.BaseStruct[] = [
            {
                exists: true,
                size: 1,
                price: 200,
                name: "testBase",
                image: ["testBase", "testBase"]
            }
        ];

        const emptyBase: ICoffeeShop.BaseStruct[] = [
            {
                exists: false,
                size: 0,
                price: 0,
                name: "",
                image: ["", ""]
            }
        ];

        await p.shop.addBase(testBase);
        expect(await p.shop.getBaseTypes(0)).to.deep.equal(
            Object.values(testBase[0])
        );
        await expect(p.shop.connect(userA).revokeBase(0)).to.be.revertedWith(
            getACErrorText(userA.address, Roles.ADMIN)
        );

        await p.shop.revokeBase(0);

        expect(await p.shop.getBaseTypes(0)).to.deep.equal(
            Object.values(emptyBase[0])
        );
    });

    it("revokeSize()", async () => {
        const testSize: string = "средний";
        const emptySize: string = "";

        await p.shop.addSize(testSize);
        expect(await p.shop.getSizeTypes(0)).to.deep.equal(testSize);
        await expect(p.shop.connect(userA).revokeSize(0)).to.be.revertedWith(
            getACErrorText(userA.address, Roles.ADMIN)
        );

        await p.shop.revokeSize(0);

        expect(await p.shop.getSizeTypes(0)).to.deep.equal(emptySize);
    });

    it("mintCoffee()", async () => {
        const testMilk: ICoffeeShop.MilkStruct[] = [
            {
                exists: true,
                name: "testMilk",
                image: ["testMilk1", "testMilk2", "testMilk3"]
            }
        ];

        const testSyrup: ICoffeeShop.SyrupStruct[] = [
            {
                exists: true,
                name: "testSyrup",
                image: ["testSyrup", "testSyrup", "testSyrup"],
                price: ethers.utils.parseEther("50")
            }
        ];

        const testPowder: ICoffeeShop.PowderStruct[] = [
            {
                exists: true,
                name: "testPowder",
                image: ["testPowder", "testPowder", "testPowder"],
                price: ethers.utils.parseEther("50")
            }
        ];

        const testBase: ICoffeeShop.BaseStruct[] = [
            {
                exists: true,
                size: 1,
                price: ethers.utils.parseEther("200"),
                name: "testBase",
                image: ["testBase", "testBase"]
            }
        ];

        await p.shop.addMilk(testMilk);
        await p.shop.addSyrup(testSyrup);
        await p.shop.addPowder(testPowder);
        await p.shop.addBase(testBase);

        const bases: Array<number> = [0];
        const milks: Array<number> = [0];
        const syrups: Array<number> = [0];
        const powders: Array<number> = [0];

        await expect(
            p.shop.connect(userA).mintCoffee([[2, 3, 5, 6]])
        ).to.be.revertedWith("464");

        const balance: BigNumber = ethers.utils.parseEther("10000");
        const priceCoffee: BigNumber = ethers.utils.parseEther("300");

        await p.shop.setAllowedProduct(bases, milks, syrups, powders);

        await p.rubc.mint(userA.address, balance);

        await p.rubc.connect(userA).approve(p.shop.address, balance);

        await p.shop.connect(userA).mintCoffee([
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]);

        expect(await p.rubc.balanceOf(userA.address)).to.deep.equal(
            balance.sub(priceCoffee.mul(5))
        );

        const userCoffee: Array<number> = [0, 1, 2, 3, 4];

        expect(await p.shop.getUserCoffee(userA.address)).to.deep.equal(
            userCoffee
        );
    });

    it("transfer()", async () => {
        const testMilk: ICoffeeShop.MilkStruct[] = [
            {
                exists: true,
                name: "testMilk",
                image: ["testMilk1", "testMilk2", "testMilk3"]
            }
        ];

        const testSyrup: ICoffeeShop.SyrupStruct[] = [
            {
                exists: true,
                name: "testSyrup",
                image: ["testSyrup", "testSyrup", "testSyrup"],
                price: ethers.utils.parseEther("50")
            }
        ];

        const testPowder: ICoffeeShop.PowderStruct[] = [
            {
                exists: true,
                name: "testPowder",
                image: ["testPowder", "testPowder", "testPowder"],
                price: ethers.utils.parseEther("50")
            }
        ];

        const testBase: ICoffeeShop.BaseStruct[] = [
            {
                exists: true,
                size: 1,
                price: ethers.utils.parseEther("200"),
                name: "testBase",
                image: ["testBase", "testBase"]
            }
        ];

        await p.shop.addMilk(testMilk);
        await p.shop.addSyrup(testSyrup);
        await p.shop.addPowder(testPowder);
        await p.shop.addBase(testBase);

        const bases: Array<number> = [0];
        const milks: Array<number> = [0];
        const syrups: Array<number> = [0];
        const powders: Array<number> = [0];

        const balance: BigNumber = ethers.utils.parseEther("10000");
        const priceCoffee: BigNumber = ethers.utils.parseEther("300");

        await p.shop.setAllowedProduct(bases, milks, syrups, powders);

        await p.rubc.mint(userA.address, balance);

        await p.rubc.connect(userA).approve(p.shop.address, balance);

        await p.shop.connect(userA).mintCoffee([
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]);

        await p.shop.connect(userA).transfer(userB.address, 3);

        expect(await p.shop.getUserCoffee(userB.address)).to.deep.equal([3]);
    });

    it("burnCoffee()", async () => {
        const testMilk: ICoffeeShop.MilkStruct[] = [
            {
                exists: true,
                name: "testMilk",
                image: ["testMilk1", "testMilk2", "testMilk3"]
            }
        ];

        const testSyrup: ICoffeeShop.SyrupStruct[] = [
            {
                exists: true,
                name: "testSyrup",
                image: ["testSyrup", "testSyrup", "testSyrup"],
                price: ethers.utils.parseEther("50")
            }
        ];

        const testPowder: ICoffeeShop.PowderStruct[] = [
            {
                exists: true,
                name: "testPowder",
                image: ["testPowder", "testPowder", "testPowder"],
                price: ethers.utils.parseEther("50")
            }
        ];

        const testBase: ICoffeeShop.BaseStruct[] = [
            {
                exists: true,
                size: 1,
                price: ethers.utils.parseEther("200"),
                name: "testBase",
                image: ["testBase", "testBase"]
            }
        ];

        await p.shop.addMilk(testMilk);
        await p.shop.addSyrup(testSyrup);
        await p.shop.addPowder(testPowder);
        await p.shop.addBase(testBase);

        const bases: Array<number> = [0];
        const milks: Array<number> = [0];
        const syrups: Array<number> = [0];
        const powders: Array<number> = [0];

        const balance: BigNumber = ethers.utils.parseEther("10000");
        const priceCoffee: BigNumber = ethers.utils.parseEther("300");

        await p.shop.setAllowedProduct(bases, milks, syrups, powders);

        await p.rubc.mint(userA.address, balance);

        await p.rubc.connect(userA).approve(p.shop.address, balance);

        await p.shop.connect(userA).mintCoffee([
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]);

        const coffeeProducts: Array<number> = [1, 2, 3];
        const signatures = await Promise.all(
            coffeeProducts.map((pid) =>
                userA.signMessage(
                    arrayify(
                        keccak256(defaultAbiCoder.encode(["uint256"], [pid]))
                    )
                )
            )
        );

        await expect(
            p.shop.connect(userA).burnCoffee(coffeeProducts, signatures)
        ).to.be.revertedWith(getACErrorText(userA.address, Roles.COFFEE_HOUSE));

        await p.shop.setCoffeeHouse(userB.address, owner.address);

        await p.shop.connect(userB).burnCoffee(coffeeProducts, signatures);

        expect(await p.shop.getUserCoffee(userA.address)).to.deep.equal([0, 4]);
    });
});
