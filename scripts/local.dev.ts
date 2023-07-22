import { parseEther } from "ethers/lib/utils";
import {
    TASK_NODE_CREATE_SERVER,
    TASK_NODE_GET_PROVIDER
} from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import { deployTesting } from "./util";
import { populateBases } from "./configure";
import { Wallet } from "ethers";

const HARDHAT_NETWORK_MNEMONIC =
    "test test test test test test test test test test test junk";

const HOSTNAME = "0.0.0.0";
const PORT = 8545;

task("local", "Deploy contracts to local network", async (_, hre) => {
    await hre.run("compile");

    const hreProvider = await hre.run(TASK_NODE_GET_PROVIDER);

    const server = await hre.run(TASK_NODE_CREATE_SERVER, {
        hostname: HOSTNAME,
        port: PORT,
        provider: hreProvider
    });

    await hreProvider.request({
        method: "hardhat_setLoggingEnabled",
        params: [false]
    });

    await server.listen();

    const wallets = [];

    for (let i = 0; i < 10; i++) {
        wallets.push(
            hre.ethers.Wallet.fromMnemonic(
                HARDHAT_NETWORK_MNEMONIC,
                `m/44'/60'/0'/0/${i}`
            )
        );

        await hre.ethers.provider.send("hardhat_setBalance", [
            wallets[i].address,
            parseEther("1777")._hex
        ]);
    }

    const accounts = await Promise.all(
        wallets.map((w) =>
            hre.ethers
                .getSigner(w.address)
                .then((s) => Object.assign(s, { privateKey: w.privateKey }))
        )
    );

    const [owner, ...users] = accounts;

    const p = await deployTesting(owner, hre);

    console.log("Protocol configuration...");

    await populateBases(p.shop);

    console.log("CoffeeShop:", p.shop.address);
    console.log("RubleCoin:", p.rubc.address);
    console.log("Render:", p.render.address);

    for (const user of users) {
        await p.rubc.mint(user.address, parseEther("1000"));
    }

    console.log(
        `Owner: [KEY: ${owner.privateKey}] [ADDRESS: ${owner.address}]`
    );

    console.log(
        "Users:",
        users.map((u) => `[KEY: ${u.privateKey}] [ADDRESS: ${u.address}]`)
    );

    console.log(`Server is listening on ${HOSTNAME}:${PORT}`);

    await server.waitUntilClosed();
});
