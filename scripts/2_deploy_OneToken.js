const hre = require("hardhat");
const { BLOCKCHAIN } = require('../config')

async function main() {

const OneToken = await hre.ethers.getContractFactory("OneToken");
const DeployOneToken = await OneToken.deploy(BLOCKCHAIN.ADMIN_ADDRESS)
await DeployOneToken.waitForDeployment()
console.log("Deployed ONE Token Address:--", await DeployOneToken.getAddress())

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
