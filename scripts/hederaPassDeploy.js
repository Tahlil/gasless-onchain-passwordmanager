const path = require('path');
const fs = require('fs');
const { artifacts } =  require("hardhat");

require("dotenv").config({ path: path.resolve(__dirname, '..', '.env') });
const contractDetailsDataPath = path.join(__dirname, "../", "deployInfo", "deployPassHedera.json");

const {
	AccountId,
	PrivateKey,
	Client,
	ContractFunctionParameters,
	Hbar,
	ContractCreateFlow,
} = require("@hashgraph/sdk");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
const operatorPrivateKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_PVKEY);

const client = Client.forTestnet();
client.setOperator(operatorId, operatorPrivateKey);


async function main() {

	const contractArtifact = await artifacts.readArtifact("Pass");
	const bytecode = contractArtifact.bytecode;

	const contractInstantiateTx = new ContractCreateFlow()
		.setBytecode(bytecode)
		.setGas(500000);
	const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
	const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
	
	const contractId = contractInstantiateRx.contractId;

	const contractAddress = contractId.toSolidityAddress();
	console.log(`- The Greeter smart contract ID is: ${contractId} \n`);
	console.log(`- The Greeter smart contract ID in Solidity format is: ${'0x' + contractAddress} \n`);

	try {
        await fs.writeFileSync(contractDetailsDataPath, JSON.stringify({pass: contractId+"", link: `https://hashscan.io/testnet/contract/${contractId}`}, null, 2));
        console.log('File created and data written successfully.');
      } catch (err) {
        console.error('Error creating file:', err);
      }

	process.exit();

}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
  });