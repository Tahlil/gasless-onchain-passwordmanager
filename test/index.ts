import { ethers } from 'hardhat';
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from 'chai';
import { Pass__factory, Pass } from '../frontend/typechain'


describe('password manager', () => {

  async function signMessage(signer: { signMessage: (arg0: Uint8Array) => any; }) {
    let randomString = ethers.utils.id("123321asddsa");

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

  it.only("Check platform listing functionality", async function () {
    const { passContract } = await loadFixture(deployOnceFixture);
    
    const platform = "google";
    expect(!(await passContract.isWhitelistPlatform(platform)));

    let tx = await passContract.registerPlatform(platform);
    await tx.wait();

    expect(!(await passContract.isWhitelistPlatform(platform)));
  });

  it.only("Check platform listing functionality", async function () {
    const { passContract } = await loadFixture(deployOnceFixture);
    
    const platform = "google";
    expect(!(await passContract.isWhitelistPlatform(platform)));

    let tx = await passContract.registerPlatform(platform);
    await tx.wait();

    expect(!(await passContract.isWhitelistPlatform(platform)));
  });

	// it("Should return the new greeting once it's changed", async () => {
    // const { greeter } = await loadFixture(deployOnceFixture);
	// 	let tx = await greeter.setGreeting('Hola, mundo!');
    // await tx.wait();
	// 	expect(await greeter.greet()).to.equal('Hola, mundo!');
	// });

});