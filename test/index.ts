import { ethers } from 'hardhat';
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from 'chai';
import { Pass__factory, Pass } from '../frontend/typechain'


describe('password manager', () => {

  async function deployOnceFixture() {
    const [owner, ...otherAccounts] = await ethers.getSigners();
    const userAddress = otherAccounts[2].address;
    const passContract: Pass = await new Pass__factory(owner).deploy();
    return { passContract, owner, userAddress, otherAccounts };
  }

  it("Check user listing functionality", async function () {
    const { passContract, userAddress } = await loadFixture(deployOnceFixture);
    
    expect(!(await passContract.isWhitelist(userAddress)));

    let tx = await passContract.registerFunction(userAddress);
    await tx.wait();

    expect(!(await passContract.isWhitelist(userAddress)));
  });

	// it("Should return the new greeting once it's changed", async () => {
    // const { greeter } = await loadFixture(deployOnceFixture);
	// 	let tx = await greeter.setGreeting('Hola, mundo!');
    // await tx.wait();
	// 	expect(await greeter.greet()).to.equal('Hola, mundo!');
	// });

});