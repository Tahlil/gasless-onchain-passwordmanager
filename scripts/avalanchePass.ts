import { ethers } from "hardhat";
import { Pass } from "../frontend/typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {

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
    console.log("Register Function Timestamp: ",Date.now());

    console.time("Register_Function_timer")
    const txReceiptRegisterFunction = await registerFunction(pass, contractOwner);
    console.timeEnd("Register_Function_timer")
    console.log(txReceiptRegisterFunction)
    const gasUsedRegisterFunction = ethers.utils.formatUnits(txReceiptRegisterFunction.gasUsed, 18);
    console.log("RegisterFunction used gas: ", gasUsedRegisterFunction);

    //RegisterPlatform Transaction
    console.log("Register Platform Timestamp: ",Date.now());

    console.time("Register_Platform_timer")
    const txReceiptRegisterPlatform = await registerPlatform(pass, "Test");
    console.timeEnd("Register_Platform_timer")
    console.log(txReceiptRegisterPlatform);
    const gasUsedRegisterPlatform = ethers.utils.formatUnits(txReceiptRegisterPlatform.gasUsed, 18);
    console.log("RegisterPlatform used gas: ", gasUsedRegisterPlatform);

    //Store Password Transaction
    console.log("Store Password Timestamp: ",Date.now());

    console.time("Store_Password_timer")
    const txReceiptStorePassword = await storePassword(pass, contractOwner, "Test", "fdh1fklsf");
    console.timeEnd("Store_Password_timer")
    console.log(txReceiptStorePassword)
    const gasUsedStorePassword = ethers.utils.formatUnits(txReceiptStorePassword.gasUsed, 18);
    console.log("Store Password used gas: ", gasUsedStorePassword);

    //Get Password
    console.log("Get Password Timestamp: ",Date.now());

    console.time("Get_Password_timer")
    const encryptedPassword = await getPassword(pass, "Test");
    console.timeEnd("Get_Password_timer")
    console.log(encryptedPassword)

    //Freeze Account Transaction
    console.log("Freeze Account Timestamp: ",Date.now());

    console.time("Freeze_Account_timer");
    const txReceiptFreezeAccount = await freezeAccount(pass, contractOwner, otherAccounts[0]);
    console.timeEnd("Freeze_Account_timer");
    console.log(txReceiptFreezeAccount)
    const gasUsedFreezeAccount = ethers.utils.formatUnits(txReceiptFreezeAccount.gasUsed, 18);
    console.log("Freeze Account used gas: ", gasUsedFreezeAccount);


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