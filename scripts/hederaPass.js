const path = require("path");
const fs = require("fs");
const { artifacts } = require("hardhat");
const ethers = require("ethers");

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
  //   const contractArtifact = await artifacts.readArtifact("Pass");
  //   const contractABI = contractArtifact.abi;
  //   const bytecode = contractArtifact.bytecode;

  //   const contractInstantiateTx = new ContractCreateFlow()
  //     .setBytecode(bytecode)
  //     .setGas(500000);
  //   const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
  //   const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(
  //     client
  //   );
  const filePath = path.join(
    __dirname,
    "../",
    "deployInfo",
    "deployPassHedera.json"
  );
  let passKey;
  try {
    // Read the file
    const data = await fs.readFileSync(filePath, "utf8");

    // Parse JSON data
    const jsonData = JSON.parse(data);

    // Access the "pass" key
    passKey = jsonData.pass;

    console.log('Value of "pass" key:', passKey);
  } catch (error) {
    console.error("Error reading/parsing the file:", error);
  } finally {
    const passContractId = passKey;
   
    // Register platform
    console.time("Set_Pass_Value_timer");
    const txReceipt = await storePassword(passContractId);
    console.timeEnd("Set_Pass_Value_timer");
    console.log({ txReceipt });
    process.exit();
  }

  //   const contractAddress = contractId.toSolidityAddress();
  //   console.log(`- The Password manager smart contract ID is: ${passContractId} \n`);
  //   console.log(
  //     `- The Pass smart contract ID in Solidity format is: ${
  //       "0x" + contractAddress
  //     } \n`
  //   );

  //   process.exit();
}

async function registerFunction(passContractId) {
  let contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(passContractId)
    .setGas(200000)
    .setFunction(
      "registerFunction",
      new ContractFunctionParameters().addAddress(
        "0xcb482912Fd8461B8BF8408BA1509192930766C8B"
      )
    );
  let contractExecuteSubmit = await contractExecuteTx.execute(client);
  let contractExecuteRx = await contractExecuteSubmit.getReceipt(client);

  return contractExecuteRx;
}

async function registerPlatform(passContractId) {
  let contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(passContractId)
    .setGas(200000)
    .setFunction(
      "registerPlatform",
      new ContractFunctionParameters().addString("hfewfhewhdf")
    );
  let contractExecuteSubmit = await contractExecuteTx.execute(client);
  let contractExecuteRx = await contractExecuteSubmit.getReceipt(client);

  return contractExecuteRx;
}

async function storePassword(passContractId) {
  // Your string data
  let myString = "TestTest";

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
        .addString("hfewfhewhdf")
        .addString("fdh1fklsf")
        .addBytes32(bytes32Param)
        .addUint8(v)
        .addBytes32(ethers.utils.arrayify(r))
        .addBytes32(ethers.utils.arrayify(s))
        .addAddress(wallet.address+"")
    );
  let contractExecuteSubmit = await contractExecuteTx.execute(client);
  let contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
  let contractExecuteRec = await contractExecuteSubmit.getRecord(client);

console.log(contractExecuteRec);
  return contractExecuteRx;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
