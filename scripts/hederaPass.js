const path = require("path");
const fs = require("fs");
const { artifacts } = require("hardhat");
const ethers = require("ethers");
const hederaPassDataPath = path.join(__dirname, "../", "results", "hederaPassUSD.json");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const { hethers } = require("@hashgraph/hethers");
const {
  AccountId,
  PrivateKey,
  Client,
  // FileCreateTransaction,
  // ContractCreateTransaction,
  ContractFunctionParameters,
  ContractExecuteTransaction,
  ContractCallQuery,
  Hbar,
  ContractCreateFlow,
} = require("@hashgraph/sdk");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
const operatorPrivateKey = PrivateKey.fromStringECDSA(
  process.env.HEDERA_OPERATOR_PVKEY
);
const solidityAddress = process.env.HEDERA_SOLIDITY_ADDRESS;

const client = Client.forTestnet();
client.setOperator(operatorId, operatorPrivateKey);

async function main() {
    let startTime, endTime;
    const contractArtifact = await artifacts.readArtifact("Pass");

    const bytecode = contractArtifact.bytecode;

    const contractInstantiateTx = new ContractCreateFlow()
      .setBytecode(bytecode)
      .setGas(500000);
    const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(
      client
    );
    const passContractId = contractInstantiateRx.contractId;
	console.log(`- The Greeter smart contract ID is: ${passContractId} \n`);

    await registerFunction(passContractId, "0xa3a9d3a54630a1b8886f01038b2f9f5076025686");

    const obj = {}
    
    let timestampRegisterFunction = Date.now()
    console.time("Set_Pass_Value_timer");
    startTime = performance.now();
    let txFee = await registerFunction(passContractId, "0xcb482912Fd8461B8BF8408BA1509192930766C8B");
    endTime = performance.now();
    console.timeEnd("Set_Pass_Value_timer");
    obj["registerFunction"] = {[timestampRegisterFunction]: `${txFee}/${endTime-startTime}ms`};
    console.log("Register function done");

    timestampRegisterFunction = Date.now()
    console.time("Set_Pass_Value_timer");
    startTime = performance.now();
    txFee = await registerPlatform(passContractId);
    endTime = performance.now();
    console.timeEnd("Set_Pass_Value_timer");
    obj["registerPlatform"] = {[timestampRegisterFunction]: `${txFee}/${endTime-startTime}ms`};
    console.log("Register platform done");


    timestampRegisterFunction = Date.now()
    console.time("Set_Pass_Value_timer");
    startTime = performance.now();
    txFee = await storePassword(passContractId);
    endTime = performance.now();
    console.timeEnd("Set_Pass_Value_timer");
    obj["storePassword"] = {[timestampRegisterFunction]: `${txFee}/${endTime-startTime}ms`};
    console.log("Store password done");

    timestampRegisterFunction = Date.now()
    console.time("Set_Pass_Value_timer");
    startTime = performance.now();
    txFee = await getPassword(passContractId);
    endTime = performance.now();
    console.timeEnd("Set_Pass_Value_timer");
    obj["getPassword"] = {[timestampRegisterFunction]: `${txFee}/${endTime-startTime}ms`};
    console.log("Get password done");

    timestampRegisterFunction = Date.now()
    console.time("Set_Pass_Value_timer");
    startTime = performance.now();
    txFee = await freezeAccount(passContractId);
    endTime = performance.now();
    console.timeEnd("Set_Pass_Value_timer");
    obj["freezeAccount"] = {[timestampRegisterFunction]: `${txFee}/${endTime-startTime}ms`};
    console.log("Freeze account done");

    fs.writeFileSync(hederaPassDataPath, JSON.stringify(obj), null, 2);
    process.exit();
//   const filePath = path.join(
//     __dirname,
//     "../",
//     "deployInfo",
//     "deployPassHedera.json"
//   );
//   let passKey;
//   try {
//     // Read the file
//     const data = await fs.readFileSync(filePath, "utf8");

//     // Parse JSON data
//     const jsonData = JSON.parse(data);

//     // Access the "pass" key
//     passKey = jsonData.pass;

//     console.log('Value of "pass" key:', passKey);
//   } catch (error) {
//     console.error("Error reading/parsing the file:", error);
//   } finally {
//     const passContractId = passKey;

//     // Register platform
  
//   }

  //   const contractAddress = contractId.toSolidityAddress();
  //   console.log(`- The Password manager smart contract ID is: ${passContractId} \n`);
  //   console.log(
  //     `- The Pass smart contract ID in Solidity format is: ${
  //       "0x" + contractAddress
  //     } \n`
  //   );

  //   process.exit();
}

async function registerFunction(passContractId, userAddress) {
  let contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(passContractId)
    .setGas(200000)
    .setFunction(
      "registerFunction",
      new ContractFunctionParameters().addAddress(
        userAddress
      )
    );
  let contractExecuteSubmit = await contractExecuteTx.execute(client);
  let contractExecuteRx = await contractExecuteSubmit.getReceipt(client);

  let contractExecuteRec = await contractExecuteSubmit.getRecord(client);

  return (
    (Number(contractExecuteRec.transactionFee._valueInTinybar) *
      contractExecuteRx.exchangeRate.exchangeRateInCents) /
    10 ** 10
  );
}

async function registerPlatform(passContractId) {
  let contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(passContractId)
    .setGas(200000)
    .setFunction(
      "registerPlatform",
      new ContractFunctionParameters().addString("Test")
    );
  let contractExecuteSubmit = await contractExecuteTx.execute(client);
  let contractExecuteRx = await contractExecuteSubmit.getReceipt(client);

  let contractExecuteRec = await contractExecuteSubmit.getRecord(client);

  return (
    (Number(contractExecuteRec.transactionFee._valueInTinybar) *
      contractExecuteRx.exchangeRate.exchangeRateInCents) /
    10 ** 10
  );
}

async function storePassword(passContractId) {
  // Your string data
  let myString = "123321asddsa";

  // Truncate or pad the string to 32 bytes
  if (myString.length > 32) {
    myString = myString.slice(0, 32); // Truncate if longer than 32 bytes
  } else {
    myString = ethers.utils.formatBytes32String(myString).padEnd(66, "0"); // Pad with zeros to reach 32 bytes
  }

  // Convert string to bytes32
  const bytes32Param = ethers.utils.arrayify(myString);

  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    hethers.providers.getDefaultProvider("testnet")
  );
  console.log(wallet.address);
  let signature = await wallet.signMessage(bytes32Param);
  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);
  let contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(passContractId)
    .setGas(200000)
    .setFunction(
      "storePassword",
      new ContractFunctionParameters()
        .addString("Test")
        .addString("fdh1fklsf")
        .addBytes32(bytes32Param)
        .addUint8(v)
        .addBytes32(ethers.utils.arrayify(r))
        .addBytes32(ethers.utils.arrayify(s))
        .addAddress(wallet.address + "")
    );
  let contractExecuteSubmit = await contractExecuteTx.execute(client);
  let contractExecuteRx = await contractExecuteSubmit.getReceipt(client);

  let contractExecuteRec = await contractExecuteSubmit.getRecord(client);

  return (
    (Number(contractExecuteRec.transactionFee._valueInTinybar) *
      contractExecuteRx.exchangeRate.exchangeRateInCents) /
    10 ** 10
  );
}

async function freezeAccount(passContractId) {
    // Your string data
    let myString = "123321asddsadkjfdkfjdkfj";
  
    // Truncate or pad the string to 32 bytes
    if (myString.length > 32) {
      myString = myString.slice(0, 32); // Truncate if longer than 32 bytes
    } else {
      myString = ethers.utils.formatBytes32String(myString).padEnd(66, "0"); // Pad with zeros to reach 32 bytes
    }
  
    // Convert string to bytes32
    const bytes32Param = ethers.utils.arrayify(myString);
  
    const wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      hethers.providers.getDefaultProvider("testnet")
    );
    console.log(wallet.address);
    let signature = await wallet.signMessage(bytes32Param);
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    const v = parseInt(signature.slice(130, 132), 16);
    let contractExecuteTx = new ContractExecuteTransaction()
      .setContractId(passContractId)
      .setGas(200000)
      .setFunction(
        "freezeAccount",
        new ContractFunctionParameters()
          .addAddress(wallet.address + "")
          .addAddress(solidityAddress)
          .addBytes32(bytes32Param)
          .addUint8(v)
          .addBytes32(ethers.utils.arrayify(r))
          .addBytes32(ethers.utils.arrayify(s))
      );
    let contractExecuteSubmit = await contractExecuteTx.execute(client);
    let contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
  
    let contractExecuteRec = await contractExecuteSubmit.getRecord(client);
  
    return (
      (Number(contractExecuteRec.transactionFee._valueInTinybar) *
        contractExecuteRx.exchangeRate.exchangeRateInCents) /
      10 ** 10
    );
  }

  async function getPassword(greeterContractId) {
	let contractExecuteTx = await new ContractExecuteTransaction()
		.setContractId(greeterContractId)
		.setGas(200000)
		.setFunction("getPassword",
        new ContractFunctionParameters()
          .addString("Test"))
		.execute(client);
        let contractExecuteRx = await contractExecuteTx.getReceipt(client);
        let contractExecuteRec = await contractExecuteTx.getRecord(client);
 
        return (
          (Number(contractExecuteRec.transactionFee._valueInTinybar) *
            contractExecuteRx.exchangeRate.exchangeRateInCents) /
          10 ** 10
        );   
        // let contractExecuteSubmit = await contractExecuteTx.execute(client);
        // let contractExecuteRx = await contractExecuteTx.getReceipt(client);
      
        // let contractExecuteRec = await contractExecuteTx.getRecord(client);
      
        // return (
        //   (Number(contractExecuteRec.transactionFee._valueInTinybar) *
        //     contractExecuteRx.exchangeRate.exchangeRateInCents) /
        //   10 ** 10
        // );    

 }  

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
