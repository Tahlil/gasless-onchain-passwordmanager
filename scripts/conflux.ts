// Import the abi and bytecode from the contract artifact
import { ethers, artifacts } from "hardhat";
import { Conflux } from 'js-conflux-sdk'

import dotenv from "dotenv";
dotenv.config();

// Initialize constant variable
const TESTNET = "https://test.confluxrpc.com"

async function main () {
    // Create an instance of Conflux testnet
    const conflux  = new Conflux({
        url: TESTNET,
        networkId: 1,
        logger: console,
      });

      const contractArtifact = await artifacts.readArtifact("Greeter");
      const abi = contractArtifact.abi
      const bytecode = contractArtifact.bytecode

    // Establish wallet to make deployment.
    const wallet = conflux.wallet.addPrivateKey('0x' + process.env.PRIVATE_KEY)

    // Create instance for the contract to be deployed
    const contractInstance = conflux.Contract({abi, bytecode})

    // Deploy contract and generate contract address
    console.time("Greet_Contract_Deploy_Timer");
    const deploytx = await contractInstance.constructor("Hello World").sendTransaction({from: wallet.address}).executed()
    console.timeEnd("Greet_Contract_Deploy_Timer");

    console.log("Greeting contract deployed to: ", deploytx.contractCreated);

    // Create instance with abi and contract address
    const greeter = conflux.Contract({ abi, address: deploytx.contractCreated })

    //Get Greet Value
    console.time("Get_Greet_Value_timer");
    const greetValue = await greet(greeter);
    console.timeEnd("Get_Greet_Value_timer");
    console.log("Current Greeting value: ", greetValue);

    //Set Greet Value
    console.time("Set_Greet_Value_timer");
    const txReceipt = await setGreeting(greeter, wallet);
    console.timeEnd("Set_Greet_Value_timer");
    console.log("Set Greet Value used gas: ", txReceipt.gasUsed);

}

async function greet(greeter: any) {

    const greeterValue = await greeter
        .greet()
        .call();
 
    return greeterValue;
 }
 
 async function setGreeting(greeter: any, wallet: any) {
   
    const tx = await greeter.setGreeting('Hola, mundo!').sendTransaction({ from: wallet.address }).executed()
    return tx;
 }
 
   

main().catch((error) => {
    console.error(error);
    process.exitCode = 1
})
