import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const perpDexAddress = "0x0eA5493903cBce2aEBdd1B13fA4cDA697dd4fC14";
    const usdc = await ethers.getContractAt("TestUSDC", deployer);

    const amount = ethers.parseUnits("1000000", 6);
    await usdc.transfer(perpDexAddress, amount);
    console.log("Funded PerpDEX with USDC");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
