const hre = require("hardhat");
const { BLOCKCHAIN } = require('../config')

async function main() {

const ZeroToken = await hre.ethers.getContractFactory("ZeroToken");
const DeployZeroToken = await ZeroToken.deploy(BLOCKCHAIN.ADMIN_ADDRESS)
await DeployZeroToken.waitForDeployment()
console.log("Deployed ZERO Token Address:--", await DeployZeroToken.getAddress())

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
