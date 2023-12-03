import { ethers, artifacts } from "hardhat";
import { Greeter__factory, Greeter } from '../frontend/typechain'
// @ts-ignore
import TronWeb from "tronweb";

async function main() {

  const HttpProvider = TronWeb.providers.HttpProvider;
  const fullNode = new HttpProvider(process.env.TRON_NILE_TESTNET_RPC_URL);
  const solidityNode = new HttpProvider(process.env.TRON_NILE_TESTNET_RPC_URL);
  const eventServer = new HttpProvider(process.env.TRON_NILE_TESTNET_RPC_URL);
  const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, process.env.PRIVATE_KEY);

  tronWeb.setHeader({ "TRON-PRO-API-KEY": process.env.TRON_API_KEY });

   const contractArtifact = await artifacts.readArtifact("Greeter");
   const contractABI = contractArtifact.abi
   const bytecode = contractArtifact.bytecode

   console.time("Greet_Contract_Deploy_Timer");

   let greeter = await tronWeb.contract().new({
      abi:contractABI,
      bytecode:bytecode,
      feeLimit:15000000000,
      callValue:0,
      userFeePercentage:10,
      originEnergyLimit:10_000_000,
      parameters:["Hello World"]
    });

   console.timeEnd("Greet_Contract_Deploy_Timer");

   console.log("Greeting contract deployed to: ", greeter.address);

  //Get Greet Value
  console.time("Get_Greet_Value_timer");
  const greetValue = await greet(greeter);
  console.timeEnd("Get_Greet_Value_timer");
  console.log("Current Greeting value: ", greetValue);

  //Set Greet Value
  console.time("Set_Greet_Value_timer");
  const txReceipt = await setGreeting(tronWeb, greeter.address, greeter);
  console.timeEnd("Set_Greet_Value_timer");
  console.log(txReceipt)

  //Get Energy Value (need to use transaction id)
  //let result = await tronWeb.trx.getTransactionInfo(txReceipt.transaction.txID);
  //console.log("Set Greet Value used energy: ", result.receipt.energy_usage_total);
  
}

async function greet(greeter: any) {
   const greetValue = await greeter.greet().call();

   return greetValue;
}

async function setGreeting(tronWeb: any, address: any, greeter: any) {
  const txReceipt = await greeter.setGreeting('Hola, mundo!').send({
    feeLimit:15000000000,
    callValue:0,
    shouldPollResponse:true
  });

  // const functionSelector = 'setGreeting(string)';
  // const parameter = [{type:'string',value:'Hola, mundo!'}]
  // const tx = await tronWeb.transactionBuilder.triggerSmartContract(address, functionSelector, {}, parameter);
  // const signedTx = await tronWeb.trx.sign(tx.transaction);
  // const txReceipt = await tronWeb.trx.sendRawTransaction(signedTx);

  return txReceipt;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
