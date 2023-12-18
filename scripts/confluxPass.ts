// Import the abi and bytecode from the contract artifact
import { ethers, artifacts } from "hardhat";
import { Conflux, format, sign } from 'js-conflux-sdk'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Pass } from "../frontend/typechain";
import fs from 'fs';
import path from 'path';

import dotenv from "dotenv";
dotenv.config();

const confluxPassDataPath = path.join(__dirname, "../", "results", "confluxPass3.json");


// Initialize constant variable
const TESTNET = "https://test.confluxrpc.com"

async function main () { 
    // Create an instance of Conflux testnet
    const conflux  = new Conflux({
        url: TESTNET,
        networkId: 1,
        logger: console,
      });

      const contractArtifact = await artifacts.readArtifact("Pass");
      const abi = contractArtifact.abi
      const bytecode = contractArtifact.bytecode

    // Establish wallet to make deployment.
    const wallet1 = conflux.wallet.addPrivateKey('0x' + process.env.PRIVATE_KEY)
    const contractOwnerAddress = format.hexAddress(wallet1.address);

    const wallet2 = conflux.wallet.addPrivateKey('0x' + process.env.PRIVATE_KEY1)
    const userAddress = format.hexAddress(wallet2.address);

    let contractOwner: SignerWithAddress, otherAccounts: SignerWithAddress[], add1: SignerWithAddress;
    [contractOwner, ...otherAccounts] = await ethers.getSigners();

    let finalValue = []
    let startTime, endTime, transactionFee, gasPrice: any;

    // Create instance for the contract to be deployed
    const contractInstance = conflux.Contract({abi, bytecode})

    for(let i = 1; i <= 5; i++){

        let obj: any = {}

        // Deploy contract and generate contract address
        console.time("Password_Manager_Contract_Deploy_Timer");
        const deploytx = await contractInstance.constructor().sendTransaction({from: wallet1.address}).executed()
        console.timeEnd("Password_Manager_Contract_Deploy_Timer");

        console.log("Password Manager contract deployed to: ",  deploytx.contractCreated);

        // Create instance with abi and contract address
        const pass = conflux.Contract({ abi, address: deploytx.contractCreated })

        //RegisterFunction Transaction
        obj["registerFunction"] = {}
        let timestampRegisterFunction = Date.now()
        console.log("Register Function Timestamp: ",timestampRegisterFunction);

        console.time("Register_Function_timer")
        startTime = performance.now();
        const txReceiptRegisterFunction = await registerFunction(pass, contractOwnerAddress, wallet1);
        endTime = performance.now();
        console.timeEnd("Register_Function_timer")
        console.log(txReceiptRegisterFunction)
        const gasUsedRegisterFunction = ethers.utils.formatUnits(txReceiptRegisterFunction.gasUsed, 18);
        console.log("RegisterFunction used gas: ", gasUsedRegisterFunction);

        //gasPrice = txReceiptRegisterFunction.effectiveGasPrice

        //transactionFee = txReceiptRegisterFunction.gasUsed as any *  gasPrice;

        obj["registerFunction"][timestampRegisterFunction] = `${txReceiptRegisterFunction.gasFee}/${endTime-startTime}ms`

        //RegisterPlatform Transaction
        obj["registerPlatform"] = {}
        let timestampRegisterPlatform = Date.now()
        console.log("Register Platform Timestamp: ",timestampRegisterPlatform);

        console.time("Register_Platform_timer")
        startTime = performance.now();
        const txReceiptRegisterPlatform = await registerPlatform(pass, "Test", wallet1);
        endTime = performance.now();
        console.timeEnd("Register_Platform_timer")
        console.log(txReceiptRegisterPlatform);
        const gasUsedRegisterPlatform = ethers.utils.formatUnits(txReceiptRegisterPlatform.gasUsed, 18);
        console.log("RegisterPlatform used gas: ", gasUsedRegisterPlatform);

        //gasPrice = txReceiptRegisterPlatform.effectiveGasPrice

        //transactionFee = txReceiptRegisterPlatform.gasUsed as any *  gasPrice;
        
        obj["registerPlatform"][timestampRegisterPlatform] = `${txReceiptRegisterPlatform.gasFee}/${endTime-startTime}ms`

        //Store Password Transaction
        obj["storePassword"] = {}
        let timestampStorePassword = Date.now();
        console.log("Store Password Timestamp: ",timestampStorePassword);

        console.time("Store_Password_timer")
        startTime = performance.now();
        const txReceiptStorePassword = await storePassword(pass, contractOwner, "Test", "fdh1fklsf", wallet1, contractOwnerAddress);
        endTime = performance.now();
        console.timeEnd("Store_Password_timer")
        console.log(txReceiptStorePassword)
        const gasUsedStorePassword = ethers.utils.formatUnits(txReceiptStorePassword.gasUsed, 18);
        console.log("Store Password used gas: ", gasUsedStorePassword);

        //gasPrice = txReceiptStorePassword.effectiveGasPrice

        //transactionFee = txReceiptStorePassword.gasUsed as any *  gasPrice;

        obj["storePassword"][timestampStorePassword] = `${txReceiptStorePassword.gasFee}/${endTime-startTime}ms`

        //Get Password
        obj["getPassword"] = {}
        let timestampGetPassword = Date.now();
        console.log("Get Password Timestamp: ",timestampGetPassword);

        console.time("Get_Password_timer")
        startTime = performance.now()
        const encryptedPassword = await getPassword(pass, "Test",wallet1);
        endTime = performance.now()
        console.timeEnd("Get_Password_timer")
        console.log(encryptedPassword)

        obj["getPassword"][timestampGetPassword] = `0/${endTime-startTime}ms`;

        //Freeze Account Transaction
        obj["freezeAccount"] = {}
        let timestampFreezeAccount = Date.now()
        console.log("Freeze Account Timestamp: ",timestampFreezeAccount);

        console.time("Freeze_Account_timer");
        startTime = performance.now()
        const txReceiptFreezeAccount = await freezeAccount(pass, contractOwner, otherAccounts[0], wallet1, contractOwnerAddress, userAddress);
        endTime = performance.now()
        console.timeEnd("Freeze_Account_timer");
        console.log(txReceiptFreezeAccount)
        const gasUsedFreezeAccount = ethers.utils.formatUnits(txReceiptFreezeAccount.gasUsed, 18);
        console.log("Freeze Account used gas: ", gasUsedFreezeAccount);

        //gasPrice = txReceiptFreezeAccount.effectiveGasPrice

        //transactionFee = txReceiptFreezeAccount.gasUsed as any *  gasPrice;

        obj["freezeAccount"][timestampFreezeAccount] = `${txReceiptFreezeAccount.gasFee}/${endTime-startTime}ms`

        finalValue.push(obj);

        fs.writeFileSync(confluxPassDataPath, JSON.stringify(finalValue));

    }
}

async function registerFunction(pass: any, addressToCheck: any, wallet: any) {
   
    const tx = await pass.registerFunction(addressToCheck).sendTransaction({ from: wallet.address }).executed()
    return tx;
 }

async function registerPlatform(pass: any, platform: string, wallet: any) {
    const tx = await pass.registerPlatform(platform).sendTransaction({ from: wallet.address }).executed()
    return tx;
}

async function signMessage(signer: { signMessage: (arg0: Uint8Array) => any; }, message: string) {
    let randomString = ethers.utils.id(message);

    let messageHashBytes = ethers.utils.arrayify(randomString);

    // Sign the binary data
    let flatSig = await signer.signMessage(messageHashBytes);

    // For Solidity, we need the expanded-format of a signature
    let sig = ethers.utils.splitSignature(flatSig);

    // split signature
    const v = sig.v;
    const r = sig.r;
    const s = sig.s;

    return { messageHashBytes, v, r, s };
}

async function storePassword(pass: any, addressToCheck: SignerWithAddress, platform: string, encryptedPassword: string, wallet: any, address: any){

    const { messageHashBytes, v, r, s } = await signMessage(addressToCheck, "123321asddsa");

    const tx = await pass.storePassword(platform, encryptedPassword, messageHashBytes,
        v, r, s, address).sendTransaction({ from: wallet.address }).executed();

    return tx;

}

async function getPassword(pass: any, platform: string, wallet: any) {
    const encryptedPassword = await pass.getPassword(platform).call({ from: wallet.address });

    return encryptedPassword
}

async function freezeAccount(pass: any, addressToCheck: SignerWithAddress, backupAddress: SignerWithAddress, wallet: any, address1: any, address2: any){

    const { messageHashBytes, v, r, s } = await signMessage(addressToCheck, "123321asddsadkjfdkfjdkfj");

    const tx = await pass.freezeAccount(address1, address2, messageHashBytes,
        v, r, s).sendTransaction({ from: wallet.address }).executed();

    return tx;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1
})