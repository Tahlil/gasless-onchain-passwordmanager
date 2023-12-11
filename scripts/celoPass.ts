import { ethers } from "hardhat";
import { Pass } from "../frontend/typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import fs from 'fs';
import path from 'path';

const celoPassDataPath = path.join(__dirname, "../", "results", "celoPass.json");

async function main() {

    let finalValue = []
    let startTime, endTime, transactionFee, gasPrice: any;

    for(let i = 1; i <= 5; i++){

        let obj: any = {}

        //Deploy Password Manager Contract
        console.time("Password_Manager_Contract_Deploy_Timer");
        const Pass = await ethers.getContractFactory("Pass");
        const pass = await Pass.deploy();
        await pass.deployed();
        console.timeEnd("Password_Manager_Contract_Deploy_Timer");

        console.log("Password Manager contract deployed to: ", pass.address);


        let contractOwner: SignerWithAddress, otherAccounts: SignerWithAddress[], add1: SignerWithAddress;
        [contractOwner, ...otherAccounts] = await ethers.getSigners();

        // const userAddress = otherAccounts[2].address;
        // const user = otherAccounts[2];

        //const pass = await ethers.getContractAt("Pass", "0xE5eD41c94Fb35B28D71C4ea45a7974FBfbF70e91");

        //RegisterFunction Transaction
        obj["registerFunction"] = {}
        let timestampRegisterFunction = Date.now()
        console.log("Register Function Timestamp: ",timestampRegisterFunction);

        console.time("Register_Function_timer")
        startTime = performance.now();
        const txReceiptRegisterFunction = await registerFunction(pass, contractOwner);
        endTime = performance.now();
        console.timeEnd("Register_Function_timer")
        console.log(txReceiptRegisterFunction)
        const gasUsedRegisterFunction = ethers.utils.formatUnits(txReceiptRegisterFunction.gasUsed, 18);
        console.log("RegisterFunction used gas: ", gasUsedRegisterFunction);

        gasPrice = txReceiptRegisterFunction.effectiveGasPrice

        transactionFee = txReceiptRegisterFunction.gasUsed as any *  gasPrice;

        obj["registerFunction"][timestampRegisterFunction] = `${transactionFee}/${endTime-startTime}ms`
        

        //RegisterPlatform Transaction
        obj["registerPlatform"] = {}
        let timestampRegisterPlatform = Date.now()
        console.log("Register Platform Timestamp: ",timestampRegisterPlatform);

        console.time("Register_Platform_timer")
        startTime = performance.now();
        const txReceiptRegisterPlatform = await registerPlatform(pass, "Test");
        endTime = performance.now();
        console.timeEnd("Register_Platform_timer")
        console.log(txReceiptRegisterPlatform);
        const gasUsedRegisterPlatform = ethers.utils.formatUnits(txReceiptRegisterPlatform.gasUsed, 18);
        console.log("RegisterPlatform used gas: ", gasUsedRegisterPlatform);

        gasPrice = txReceiptRegisterFunction.effectiveGasPrice

        transactionFee = txReceiptRegisterFunction.gasUsed as any *  gasPrice;
        
        obj["registerPlatform"][timestampRegisterPlatform] = `${transactionFee}/${endTime-startTime}ms`

        //Store Password Transaction
        obj["storePassword"] = {}
        let timestampStorePassword = Date.now();
        console.log("Store Password Timestamp: ",timestampStorePassword);

        console.time("Store_Password_timer")
        startTime = performance.now();
        const txReceiptStorePassword = await storePassword(pass, contractOwner, "Test", "fdh1fklsf");
        endTime = performance.now();
        console.timeEnd("Store_Password_timer")
        console.log(txReceiptStorePassword)
        const gasUsedStorePassword = ethers.utils.formatUnits(txReceiptStorePassword.gasUsed, 18);
        console.log("Store Password used gas: ", gasUsedStorePassword);

        gasPrice = txReceiptStorePassword.effectiveGasPrice

        transactionFee = txReceiptStorePassword.gasUsed as any *  gasPrice;

        obj["storePassword"][timestampStorePassword] = `${transactionFee}/${endTime-startTime}ms`

        //Get Password
        obj["getPassword"] = {}
        let timestampGetPassword = Date.now();
        console.log("Get Password Timestamp: ",timestampGetPassword);

        console.time("Get_Password_timer")
        startTime = performance.now()
        const encryptedPassword = await getPassword(pass, "Test");
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
        const txReceiptFreezeAccount = await freezeAccount(pass, contractOwner, otherAccounts[0]);
        endTime = performance.now()
        console.timeEnd("Freeze_Account_timer");
        console.log(txReceiptFreezeAccount)
        const gasUsedFreezeAccount = ethers.utils.formatUnits(txReceiptFreezeAccount.gasUsed, 18);
        console.log("Freeze Account used gas: ", gasUsedFreezeAccount);

        gasPrice = txReceiptFreezeAccount.effectiveGasPrice

        transactionFee = txReceiptFreezeAccount.gasUsed as any *  gasPrice;

        obj["freezeAccount"][timestampFreezeAccount] = `${transactionFee}/${endTime-startTime}ms`

        finalValue.push(obj);

        fs.writeFileSync(celoPassDataPath, JSON.stringify(finalValue));

    }


}

async function registerFunction(pass: Pass, addressToCheck: SignerWithAddress) {
    const tx = await pass.registerFunction(addressToCheck.address);
    const txReceipt = await tx.wait();

    return txReceipt;
}

async function registerPlatform(pass: Pass, platform: string) {
    const tx = await pass.registerPlatform(platform);
    const txReceipt = await tx.wait();

    return txReceipt;
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

async function storePassword(pass: Pass, addressToCheck: SignerWithAddress, platform: string, encryptedPassword: string){

    const { messageHashBytes, v, r, s } = await signMessage(addressToCheck, "123321asddsa");

    const tx = await pass.storePassword(platform, encryptedPassword, messageHashBytes,
        v, r, s, addressToCheck.address);
    const txReceipt = await tx.wait();

    return txReceipt;

}

async function getPassword(pass: Pass, platform: string) {
    const encryptedPassword = await pass.getPassword(platform);

    return encryptedPassword
}

async function freezeAccount(pass: Pass, addressToCheck: SignerWithAddress, backupAddress: SignerWithAddress){

    const { messageHashBytes, v, r, s } = await signMessage(addressToCheck, "123321asddsadkjfdkfjdkfj");

    const tx = await pass.freezeAccount(addressToCheck.address, backupAddress.address, messageHashBytes,
        v, r, s);
    const txReceipt = await tx.wait();

    return txReceipt;
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });