const path = require('path');
const { ethers, artifacts } =  require("hardhat");

require("dotenv").config({ path: path.resolve(__dirname, '..', '.env') });

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
const operatorPrivateKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_PVKEY);

const client = Client.forTestnet();
client.setOperator(operatorId, operatorPrivateKey);


async function main() {

	const contractArtifact = await artifacts.readArtifact("Greeter");
	const contractABI = contractArtifact.abi
	const bytecode = contractArtifact.bytecode;

	console.time("Greet_Contract_Deploy_Timer");

	const contractInstantiateTx = new ContractCreateFlow()
		.setBytecode(bytecode)
		.setGas(500000)
		.setConstructorParameters(
			new ContractFunctionParameters()
				.addString("Hello world")
		);
	const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
	const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
	console.timeEnd("Greet_Contract_Deploy_Timer");
	const contractId = contractInstantiateRx.contractId;
	const greeterContractId = contractId;

	const contractAddress = contractId.toSolidityAddress();
	console.log(`- The Greeter smart contract ID is: ${contractId} \n`);
	console.log(`- The Greeter smart contract ID in Solidity format is: ${'0x' + contractAddress} \n`);

	//Get Greet Value
	console.time("Get_Greet_Value_timer");
	const greetValue = await greet(greeterContractId);
	console.timeEnd("Get_Greet_Value_timer");
	console.log("Gas Used for Get Greet Function: ", greetValue.gasUsed);
	console.log("Current Greeting value: ", greetValue.getString());
  
	//Set Greet Value
	console.time("Set_Greet_Value_timer");
	const txReceipt = await setGreeting(greeterContractId);
	console.timeEnd("Set_Greet_Value_timer");
	console.log(txReceipt)

	process.exit();

}

async function greet(greeterContractId) {
	let callResult = await new ContractCallQuery()
		.setContractId(greeterContractId)
		.setQueryPayment(new Hbar(2))
		.setGas(200000)
		.setFunction("greet")
		.execute(client);
 
	return callResult;
 }
 
 async function setGreeting(greeterContractId) {
	let contractExecuteTx = new ContractExecuteTransaction()
	.setContractId(greeterContractId)
	.setGas(200000)
	.setFunction(
		"setGreeting",
		new ContractFunctionParameters().addString('Hola, mundo!')
	);
	let contractExecuteSubmit = await contractExecuteTx.execute(client);
	let contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
 
   return contractExecuteRx;
 }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
  });