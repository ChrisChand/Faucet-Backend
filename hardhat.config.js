require("@nomicfoundation/hardhat-toolbox");

const { BLOCKCHAIN } = require('./config')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks:{
    mumbai:{
      url: BLOCKCHAIN.RPC_URL,
      accounts:[ BLOCKCHAIN.PRIVATE_KEY ]
    }
  }
};
