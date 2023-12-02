import { ethers } from "hardhat";
import { Greeter__factory, Greeter } from '../frontend/typechain'

async function main() {
  // const lockedAmount = ethers.utils.parseEther("1");

  const Greeter = await ethers.getContractFactory("Greeter");
  // const greeting = await Greeting.deploy("Hello world", { value: lockedAmount });
  console.time("Greet_Contract_Deploy_Timer");
  const greeter = await Greeter.deploy("Hello world");

  await greeter.deployed();
  console.timeEnd("Greet_Contract_Deploy_Timer");

  console.log("Greeting contract deployed to: ", greeter.address);

  //Get Greet Value
  console.time("Get_Greet_Value_timer");
  const greetValue = await greet(greeter);
  console.timeEnd("Get_Greet_Value_timer");
  console.log("Current Greeting value: ", greetValue);

  //Set Greet Value
  console.time("Set_Greet_Value_timer");
  const txReceipt = await setGreeting(greeter);
  console.timeEnd("Set_Greet_Value_timer");
  const gasUsed = ethers.utils.formatUnits(txReceipt.gasUsed, 18);
  console.log("Set Greet Value used gas: ", gasUsed);
}

async function greet(greeter : Greeter) {
   const greetValue = await greeter.greet();

   return greetValue;
}

async function setGreeting(greeter: Greeter) {
  const tx = await greeter.setGreeting('Hola, mundo!');
  const txReceipt = await tx.wait();

  return txReceipt;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
