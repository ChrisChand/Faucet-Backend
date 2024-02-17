require('dotenv').config()

const ZeroTokenABI = require('../ABI/ZeroToken.json')
const OneTokenABI = require('../ABI/OneToken.json')
const FaucetABI = require('../ABI/Faucet.json')

const APP = {
    PORT: process.env.PORT
}

const CONTRACTS = {
    ADDRESS:{
        ZERO_TOKEN: process.env.ZERO_TOKEN_ADDRESS,
        ONE_TOKEN: process.env.ONE_TOKEN_ADDRESS,
        FAUCET: process.env.FAUCET_ADDRESS,
    },
    ABI:{
        ZERO_TOKEN: ZeroTokenABI,
        ONE_TOKEN: OneTokenABI,
        FAUCET: FaucetABI, 
    }
}

const BLOCKCHAIN = {
    RPC_URL: process.env.RPC_URL,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    ADMIN_ADDRESS:process.env.ADMIN_ADDRESS
}

module.exports = {
    APP,
    BLOCKCHAIN,
    CONTRACTS
}