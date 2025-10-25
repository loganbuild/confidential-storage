import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { ConfidentialStorage, ConfidentialStorage__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ConfidentialStorage")) as ConfidentialStorage__factory;
  const contract = (await factory.deploy()) as ConfidentialStorage;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("ConfidentialStorage", function () {
  let signers: Signers;
  let contract: ConfidentialStorage;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("stores encrypted metadata for the caller", async function () {
    const filename = "document.pdf";
    const encryptedHash = ethers.toUtf8Bytes("cipher:hash");
    const randomWallet = ethers.Wallet.createRandom();

    const encryptedAddress = await fhevm.encryptAddress(
      randomWallet.address,
      contractAddress,
      signers.alice.address,
    );
    const encryptedAddressHandle = ethers.hexlify(encryptedAddress.externalEaddress);

    const tx = await contract
      .connect(signers.alice)
      .storeFile(filename, encryptedHash, encryptedAddressHandle, encryptedAddress.inputProof);
    const receipt = await tx.wait();

    const event = receipt!.logs?.find((log) => log.fragment?.name === "FileStored");
    expect(event?.args?.id).to.eq(1n);
    expect(event?.args?.owner).to.eq(signers.alice.address);
    expect(event?.args?.filename).to.eq(filename);

    const view = await contract.getFile(1n);
    expect(view.filename).to.eq(filename);
    expect(ethers.getBytes(view.encryptedHash)).to.deep.eq(encryptedHash);
    expect(view.encryptedAccount).to.eq(encryptedAddressHandle);
    expect(view.owner).to.eq(signers.alice.address);
  });

  it("lists all files for an owner", async function () {
    const payloads = [
      { filename: "alpha.txt", content: "hash:one" },
      { filename: "beta.txt", content: "hash:two" },
    ];

    for (const { filename, content } of payloads) {
      const encryptedAddress = await fhevm.encryptAddress(
        ethers.Wallet.createRandom().address,
        contractAddress,
        signers.alice.address,
      );
      const handle = ethers.hexlify(encryptedAddress.externalEaddress);

      await contract
        .connect(signers.alice)
        .storeFile(filename, ethers.toUtf8Bytes(content), handle, encryptedAddress.inputProof);
    }

    const files = await contract.getFiles(signers.alice.address);
    expect(files.length).to.eq(2);
    expect(files[0].filename).to.eq(payloads[0].filename);
    expect(files[1].filename).to.eq(payloads[1].filename);

    const bobFiles = await contract.getFiles(signers.bob.address);
    expect(bobFiles.length).to.eq(0);
  });

  it("reverts when filename or hash is empty", async function () {
    const encryptedAddress = await fhevm.encryptAddress(
      ethers.Wallet.createRandom().address,
      contractAddress,
      signers.alice.address,
    );
    const encryptedAddressHandle = ethers.hexlify(encryptedAddress.externalEaddress);

    await expect(
      contract
        .connect(signers.alice)
        .storeFile("", ethers.toUtf8Bytes("hash"), encryptedAddressHandle, encryptedAddress.inputProof),
    ).to.be.revertedWithCustomError(contract, "EmptyFilename");

    await expect(
      contract
        .connect(signers.alice)
        .storeFile("file.txt", "0x", encryptedAddressHandle, encryptedAddress.inputProof),
    ).to.be.revertedWithCustomError(contract, "EmptyHash");
  });

  it("reverts when requesting an unknown file", async function () {
    await expect(contract.getFile(99n)).to.be.revertedWithCustomError(contract, "FileNotFound");
  });
});
