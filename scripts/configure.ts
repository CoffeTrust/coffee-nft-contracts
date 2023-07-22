import { CoffeeShop } from "../typechain-types";
import bases from "./assets/bases.json";
import syrup from "./assets/syrup.json";
import powder from "./assets/powder.json";
import milk from "./assets/milk.json";
import Маленький from "./assets/sizes/Маленький.json";
import Средний from "./assets/sizes/Средний.json";
import Большой from "./assets/sizes/Большой.json";
import { parseEther } from "ethers/lib/utils";

export type Base = {
    allowedSizes: number[];
    allowedSyrups: number[];
    allowedPowders: number[];
    allowedMilks: number[];
    defaultSize: number;
    price: number;
    name: string;
    image: {
        base: string;
        feature: string;
    };
};

export type Size = {
    name: string;
    obj: {
        open: string;
        middle: string;
        close: string;
        price: number;
    };
};

export type Syrup = {
    name: string;
    price: number;
    image: [string, string, string];
};

export type Powder = Syrup;

export type Milk = {
    open: string;
    close: string;
    types: { name: string; color: string }[];
};

export const populateBases = async (shop: CoffeeShop) => {
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

    for (const size of sizes) {
        await shop.addSize({
            exists: true,
            name: size.name,
            image: [size.obj.open, size.obj.middle, size.obj.close],
            price: parseEther(size.obj.price.toString())
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////
    for (let i = 0; i < basesTyped.length; i++) {
        const base = basesTyped[i];

        await shop.addBase({
            exists: true,
            price: parseEther(base.price.toString()),
            defaultSize: base.defaultSize,
            name: base.name,
            image: [base.image.base, base.image.feature]
        });

        await shop.setAllowedProduct(i, {
            sizes: base.allowedSizes,
            milks: base.allowedMilks,
            syrups: base.allowedSyrups,
            powders: base.allowedPowders
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////
    for (const syrup of syrupTyped) {
        await shop.addSyrup({
            exists: true,
            price: parseEther(syrup.price.toString()),
            name: syrup.name,
            image: syrup.image
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////
    for (const powder of powderTyped) {
        await shop.addPowder({
            exists: true,
            price: parseEther(powder.price.toString()),
            name: powder.name,
            image: powder.image
        });
    }
    //////////////////////////////////////////////////////////////////////////////////////

    for (const milk of milkTyped.types) {
        await shop.addMilk({
            exists: true,
            name: milk.name,
            image:
                milk.color === ""
                    ? ["", "", ""]
                    : [milkTyped.open, milk.color, milkTyped.close]
        });
    }
};
