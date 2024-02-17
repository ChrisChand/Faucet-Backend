const express = require('express')
const bodyParser = require('body-parser')
const ethers = require('ethers')

// Contract Interaction Setup
const { APP, BLOCKCHAIN, CONTRACTS } = require('./config')
const blockchainProvider = new ethers.providers.JsonRpcProvider(BLOCKCHAIN.RPC_URL)
const signer = new ethers.Wallet(BLOCKCHAIN.PRIVATE_KEY, blockchainProvider) 
const contractInstance = new ethers.Contract(CONTRACTS.ADDRESS.FAUCET, CONTRACTS.ABI.FAUCET,signer)

// Nodejs Express API Setup
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Created API to send Token to another from Faucet Contract
// Transaction cost will bared by admin(gas fees to executing the Transaction)
app.post('/faucet', async function (req, res) {
    try{
        const { walletAddress, tokenAddress, amount }=req.body
        const sendTokens =  ethers.utils.parseEther(amount)
        console.log("Started Blockchain Transcation.")

        const tx = await  contractInstance.faucteTokenToAnotherAddress(walletAddress, tokenAddress, sendTokens)

        console.log("Waiting for Blockchain Transaction to get complete");

        await tx.wait()

        console.log("Blockchain Transaction got Completed...");

        res.json({success: true})
    }catch(err){
        console.log("Error while Executing Blockchain Tranaction..");
        res.status(500).send(err.message)    
    }
})

app.listen(APP.PORT,(err)=>{
    console.log("Nodejs is running in port", APP.PORT);
})