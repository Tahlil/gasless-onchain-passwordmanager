import { ethers, artifacts } from "hardhat";
// @ts-ignore
import TronWeb from "tronweb";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {

  let contractOwner: SignerWithAddress, otherAccounts: SignerWithAddress[], add1: SignerWithAddress;
  [contractOwner, ...otherAccounts] = await ethers.getSigners();


    const HttpProvider = TronWeb.providers.HttpProvider;
    const fullNode = new HttpProvider(process.env.TRON_NILE_TESTNET_RPC_URL);
    const solidityNode = new HttpProvider(process.env.TRON_NILE_TESTNET_RPC_URL);
    const eventServer = new HttpProvider(process.env.TRON_NILE_TESTNET_RPC_URL);
    const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, process.env.PRIVATE_KEY);

    tronWeb.setHeader({ "TRON-PRO-API-KEY": process.env.TRON_API_KEY });

    const contractArtifact = await artifacts.readArtifact("Pass");
    const abi = contractArtifact.abi
    const bytecode = contractArtifact.bytecode

    console.time("Password_Manager_Contract_Deploy_Timer");
    let pass = await tronWeb.contract().new({
        abi:abi,
        bytecode:bytecode,
        feeLimit:15000000000,
        callValue:0,
        userFeePercentage:10,
        originEnergyLimit:10_000_000
        });
    console.timeEnd("Password_Manager_Contract_Deploy_Timer");
    console.log("Password Manager contract deployed to: ",  pass.address);
    console.log(pass)

    const contractOwnerAddress = tronWeb.address.fromPrivateKey(process.env.PRIVATE_KEY)
    console.log(contractOwnerAddress)

    let startTime, endTime;

    // const value = await signMessage(process.env.PRIVATE_KEY, "123321asddsadkjfdkfjdkfj")
    // console.log(value)

    //  //RegisterFunction Transaction
     let timestampRegisterFunction = Date.now()
     console.log("Register Function Timestamp: ",timestampRegisterFunction);

     console.time("Register_Function_timer")
     startTime = performance.now();
     const txReceiptRegisterFunction = await registerFunction(tronWeb, pass.address, pass, contractOwnerAddress);
     endTime = performance.now();
     console.timeEnd("Register_Function_timer")
     console.log(`${endTime-startTime}ms`)
     console.log(txReceiptRegisterFunction)
    //  //const gasUsedRegisterFunction = ethers.utils.formatUnits(txReceiptRegisterFunction.gasUsed, 18);
    //  //console.log("RegisterFunction used gas: ", gasUsedRegisterFunction);

    // //Register Platform
    let timestampRegisterPlatform = Date.now()
    console.log("Register Platform Timestamp: ",timestampRegisterPlatform);

    console.time("Register_Platform_timer")
    startTime = performance.now();
    const txReceiptRegisterPlatform = await registerPlatform(tronWeb, pass.address, pass, "Test");
    endTime = performance.now();
    console.timeEnd("Register_Platform_timer")
    console.log(`${endTime-startTime}ms`)
    console.log(txReceiptRegisterPlatform);
    // //const gasUsedRegisterPlatform = ethers.utils.formatUnits(txReceiptRegisterPlatform.gasUsed, 18);
    // //console.log("RegisterPlatform used gas: ", gasUsedRegisterPlatform);

    // //Store Password
    let timestampStorePassword = Date.now();
    console.log("Store Password Timestamp: ",timestampStorePassword);

    console.time("Store_Password_timer")
    startTime = performance.now();
    const txReceiptStorePassword = await storePassword(pass, contractOwner, "Test", "fdh1fklsf", contractOwnerAddress);
    endTime = performance.now();
    console.timeEnd("Store_Password_timer")
    console.log(`${endTime-startTime}ms`)
    console.log(txReceiptStorePassword)
    // //const gasUsedStorePassword = ethers.utils.formatUnits(txReceiptStorePassword.gasUsed, 18);
    // //console.log("Store Password used gas: ", gasUsedStorePassword);

    // //Get Password
    let timestampGetPassword = Date.now();
    console.log("Get Password Timestamp: ",timestampGetPassword);

    console.time("Get_Password_timer")
    startTime = performance.now()
    const encryptedPassword = await getPassword(pass, "Test");
    endTime = performance.now()
    console.timeEnd("Get_Password_timer")
    console.log(`${endTime-startTime}ms`)
    console.log(encryptedPassword)

    // //Freeze Account
    let timestampFreezeAccount = Date.now()
    console.log("Freeze Account Timestamp: ",timestampFreezeAccount);

    console.time("Freeze_Account_timer");
    startTime = performance.now()
    const txReceiptFreezeAccount = await freezeAccount(pass, contractOwner, contractOwnerAddress, "TDjeTzvUd2idaCBLCMZJWJ9oLXkVCf9uMy");
    endTime = performance.now()
    console.timeEnd("Freeze_Account_timer");
    console.log(`${endTime-startTime}ms`)
    console.log(txReceiptFreezeAccount)
    // //const gasUsedFreezeAccount = ethers.utils.formatUnits(txReceiptFreezeAccount.gasUsed, 18);
    // //console.log("Freeze Account used gas: ", gasUsedFreezeAccount);
    

}

async function registerFunction(tronWeb: any, address: any, pass: any, addressToCheck: any) {
    const txReceipt = await pass.registerFunction(addressToCheck).send({
      feeLimit:15000000000,
      callValue:0,
      shouldPollResponse:true
    });
  
    // const functionSelector = 'registerFunction(address)';
    // const parameter = [{type:'address',value:addressToCheck}]
    // const tx = await tronWeb.transactionBuilder.triggerSmartContract(address, functionSelector, {}, parameter);
    // const signedTx = await tronWeb.trx.sign(tx.transaction);
    // const txReceipt = await tronWeb.trx.sendRawTransaction(signedTx);
  
    return txReceipt;
  }

  async function registerPlatform(tronWeb: any, address: any, pass: any, platform: any) {
    const txReceipt = await pass.registerPlatform(platform).send({
      feeLimit:15000000000,
      callValue:0,
      shouldPollResponse:true
    });
  
    // const functionSelector = 'registerFunction(address)';
    // const parameter = [{type:'address',value:addressToCheck}]
    // const tx = await tronWeb.transactionBuilder.triggerSmartContract(address, functionSelector, {}, parameter);
    // const signedTx = await tronWeb.trx.sign(tx.transaction);
    // const txReceipt = await tronWeb.trx.sendRawTransaction(signedTx);
  
    return txReceipt;
  }

async function signMessage(signer: any, message: string) {
    let randomString = ethers.utils.id(message);

    let messageHashBytes = ethers.utils.arrayify(randomString);

    // Sign the binary data
    let flatSig = await signer.signMessage(messageHashBytes);

    //const signature = await TronWeb.Trx.signMessageV2(message, privateKey);

    // For Solidity, we need the expanded-format of a signature
    let sig = ethers.utils.splitSignature(flatSig);

    // split signature
    const v = sig.v;
    const r = sig.r;
    const s = sig.s;

    return { messageHashBytes, v, r, s };
}

async function storePassword(pass: any, contractOwner: any, platform: string, encryptedPassword: string, addressToCheck: any){

  const { messageHashBytes, v, r, s } = await signMessage(contractOwner, "123321asddsa");

  console.log(v)
  console.log(r)
  console.log(s)

  const txReceipt = await pass.storePassword(platform, encryptedPassword, messageHashBytes,
    v, r, s, addressToCheck).send({
    feeLimit:15000000000,
    callValue:0,
    shouldPollResponse:true
  });

  return txReceipt;

}

async function getPassword(pass: any, platform: string) {
  const encryptedPassword = await pass.getPassword(platform).call();

  return encryptedPassword
}

async function freezeAccount(pass: any, contractOwner: any, addressToCheck: any, backupAddress: any){

  const { messageHashBytes, v, r, s } = await signMessage(contractOwner, "123321asddsadkjfdkfjdkfj");

  const txReceipt = await pass.freezeAccount(addressToCheck, backupAddress, messageHashBytes,
    v, r, s).send({
    feeLimit:15000000000,
    callValue:0,
    shouldPollResponse:true
  });

  return txReceipt;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });