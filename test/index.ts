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
    const user = otherAccounts[2];
    const platform = "google";

    const passContract: Pass = await new Pass__factory(owner).deploy();
    return { passContract, owner, userAddress, user, otherAccounts, platform };
  }

  it("Check user listing functionality", async function () {
    const { passContract, userAddress } = await loadFixture(deployOnceFixture);
    
    expect(!(await passContract.isWhitelist(userAddress)));

    let tx = await passContract.registerFunction(userAddress);
    await tx.wait();

    expect(!(await passContract.isWhitelist(userAddress)));
  });

  it("Check platform listing functionality", async function () {
    const { passContract, platform } = await loadFixture(deployOnceFixture);
    
    expect(!(await passContract.isWhitelistPlatform(platform)));

    let tx = await passContract.registerPlatform(platform);
    await tx.wait();

    expect(!(await passContract.isWhitelistPlatform(platform)));
  });

  it("Check store password functionality", async function () {
    const { passContract, owner, platform, userAddress, user } = await loadFixture(deployOnceFixture);
    
    const { messageHashBytes, v, r, s } = await signMessage(user);

    let tx = await passContract.registerFunction(userAddress);
    await tx.wait();

    tx = await passContract.registerPlatform(platform);
    await tx.wait();

    const encryptedPassword = "fdh1fklsf";
    tx = await passContract.storePassword(platform, encryptedPassword, messageHashBytes,
      v, r, s, userAddress);
    await tx.wait();

    const pass = await passContract.connect(user).getPassword(platform);
    expect(pass === encryptedPassword);
  });

  it("Check store password functionality", async function () {
    const { passContract, otherAccounts, platform, userAddress, user } = await loadFixture(deployOnceFixture);
    
    const { messageHashBytes, v, r, s } = await signMessage(user);

    expect(!(await passContract.isWhitelist(userAddress)));

    let tx = await passContract.registerFunction(userAddress);
    await tx.wait();

    expect((await passContract.isWhitelist(userAddress)));

    tx = await passContract.registerPlatform(platform);
    await tx.wait();

    tx = await passContract.freezeAccount(userAddress, otherAccounts[3].address, messageHashBytes,
      v, r, s);
    await tx.wait();

    expect(!(await passContract.isWhitelist(userAddress)));

  });

});