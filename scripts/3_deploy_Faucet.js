const hre = require("hardhat");
const { BLOCKCHAIN } = require('../config')

async function main() {
const maxFaucetAmount =hre.ethers.parseEther("50")
const Faucet = await hre.ethers.getContractFactory("Faucet");
const DeployFaucet = await Faucet.deploy(BLOCKCHAIN.ADMIN_ADDRESS,maxFaucetAmount)
await DeployFaucet.waitForDeployment()
console.log("Deployed Faucet Address:--", await DeployFaucet.getAddress())

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
