import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { Protocol } from "./types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const deployed = <T extends Contract>(c: T) =>
    c.deployed() as Promise<T>;

export const getACErrorText = (address: string, role: string) =>
    `AccessControl: account ${address.toLowerCase()} is missing role ${role}`;

export async function deployTesting(
    owner: SignerWithAddress,
    hre: HardhatRuntimeEnvironment
) {
    const protocol: Protocol = {} as Protocol;

    protocol.rubc = await hre.ethers
        .getContractFactory("RubleCoin", owner)
        .then((f) => f.deploy())
        .then(deployed);

    protocol.shop = await hre.ethers
        .getContractFactory("CoffeeShop", owner)
        .then((f) => f.deploy(owner.address, protocol.rubc.address))
        .then(deployed);

    protocol.render = await hre.ethers
        .getContractFactory("Render", owner)
        .then((f) => f.deploy(protocol.shop.address))
        .then(deployed);

    return protocol;
}
