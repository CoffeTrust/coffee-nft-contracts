import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import * as dotenv from "dotenv";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import { HardhatUserConfig } from "hardhat/config";
import "./scripts/local.dev";

dotenv.config();

const config: HardhatUserConfig = {
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: false,
        strict: true
    },
    abiExporter: {
        path: "./abi",
        runOnCompile: true,
        clear: true,
        spacing: 2,
        only: [
            /**
             * List of specific contract names for exporting ABI
             */
            // ":ERC20",
        ],
        format: "json"
    },
    networks: {
        siberium: {
            url: "https://rpc.test.siberium.net"
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.18",
                settings: {
                    viaIR: true,
                    optimizer: {
                        enabled: true,
                        runs: 3
                    }
                }
            }
        ]
    }
};

export default config;
