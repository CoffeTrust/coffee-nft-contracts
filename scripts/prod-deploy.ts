import { CoffeeShop } from "../typechain-types";
import bases from "./assets/bases.json";
import syrup from "./assets/syrup.json";
import powder from "./assets/powder.json";
import milk from "./assets/milk.json";
import Маленький from "./assets/sizes/Маленький.json";
import Средний from "./assets/sizes/Средний.json";
import Большой from "./assets/sizes/Большой.json";
import { parseEther } from "ethers/lib/utils";
import { Base, Milk, Powder, Size, Syrup } from "./configure";
import { ethers } from "hardhat";
import { Wallet } from "ethers";

const DEPLOYER_KEY =
    "0x4ef4e9eebd717b81b54f8cb482a281589b7570cddf836bea1ac7e18aaa3f5dda";

export const deploy = async () => {
    const deployer = new Wallet(DEPLOYER_KEY).connect(ethers.provider);

    const rubC = await ethers
        .getContractFactory("RubleCoin", deployer)
        .then((f) => f.deploy());

    const shop = await ethers
        .getContractFactory("CoffeeShop", deployer)
        .then((f) => f.deploy(deployer.address, rubC.address));

    const render = await ethers
        .getContractFactory("Render", deployer)
        .then((f) => f.deploy(shop.address));

    await render.deployed();

    console.log("Render deployed to:", render.address);

    const basesTyped = bases as Base[];
    const syrupTyped = syrup as Syrup[];
    const powderTyped = powder as Powder[];
    const milkTyped = milk as Milk;

    const sizes = [
        { name: "Маленький", obj: Маленький },
        { name: "Средний", obj: Средний },
        {
            name: "Большой",
            obj: Большой
        }
    ] as Size[];

    console.log("Config sizes...");
    for (const size of sizes) {
        await shop
            .addSize({
                exists: true,
                name: size.name,
                image: [size.obj.open, size.obj.middle, size.obj.close],
                price: parseEther(size.obj.price.toString())
            })
            .then((tx) => tx.wait());
    }

    console.log("Config bases...");
    //////////////////////////////////////////////////////////////////////////////////////
    for (let i = 0; i < basesTyped.length; i++) {
        const base = basesTyped[i];

        await shop
            .addBase({
                exists: true,
                price: parseEther(base.price.toString()),
                defaultSize: base.defaultSize,
                name: base.name,
                image: [base.image.base, base.image.feature]
            })
            .then((tx) => tx.wait());

        await shop
            .setAllowedProduct(i, {
                sizes: base.allowedSizes,
                milks: base.allowedMilks,
                syrups: base.allowedSyrups,
                powders: base.allowedPowders
            })
            .then((tx) => tx.wait());
    }

    console.log("Config syrups...");
    //////////////////////////////////////////////////////////////////////////////////////
    for (const syrup of syrupTyped) {
        await shop
            .addSyrup({
                exists: true,
                price: parseEther(syrup.price.toString()),
                name: syrup.name,
                image: syrup.image
            })
            .then((tx) => tx.wait());
    }

    console.log("Config powders...");
    //////////////////////////////////////////////////////////////////////////////////////
    for (const powder of powderTyped) {
        await shop
            .addPowder({
                exists: true,
                price: parseEther(powder.price.toString()),
                name: powder.name,
                image: powder.image
            })
            .then((tx) => tx.wait());
    }
    //////////////////////////////////////////////////////////////////////////////////////

    console.log("Config milk...");
    for (const milk of milkTyped.types) {
        await shop
            .addMilk({
                exists: true,
                name: milk.name,
                image:
                    milk.color === ""
                        ? ["", "", ""]
                        : [milkTyped.open, milk.color, milkTyped.close]
            })
            .then((tx) => tx.wait());
    }
};

deploy();
