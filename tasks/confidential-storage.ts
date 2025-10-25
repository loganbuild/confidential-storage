import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("storage:address", "Prints the ConfidentialStorage deployment address").setAction(
  async (_args: TaskArguments, hre) => {
    const deployment = await hre.deployments.get("ConfidentialStorage");
    console.log(`ConfidentialStorage deployed at ${deployment.address}`);
  },
);

task("storage:store", "Stores encrypted file metadata")
  .addParam("filename", "Filename to record")
  .addParam("hash", "Encrypted hash payload (hex or utf8 string)")
  .addParam("address", "Random EVM address used for encryption")
  .addOptionalParam("contract", "Override contract address")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const { ethers, fhevm } = hre;

    await hre.fhevm.initializeCLIApi();

    const contractAddress = (taskArguments.contract as string | undefined) ?? (await hre.deployments.get("ConfidentialStorage")).address;
    const signer = (await ethers.getSigners())[0];
    const contract = await ethers.getContractAt("ConfidentialStorage", contractAddress);

    const encryptedAddress = await fhevm.encryptAddress(
      taskArguments.address as string,
      contractAddress,
      signer.address,
    );
    const encryptedHandle = ethers.hexlify(encryptedAddress.externalEaddress);

    const payload: string = taskArguments.hash as string;
    const bytes = payload.startsWith("0x") ? payload : ethers.hexlify(ethers.toUtf8Bytes(payload));

    const tx = await contract
      .connect(signer)
      .storeFile(taskArguments.filename as string, bytes, encryptedHandle, encryptedAddress.inputProof);
    console.log(`Submitted storeFile tx ${tx.hash}`);
    await tx.wait();
  });

task("storage:list", "Lists files owned by an address")
  .addOptionalParam("owner", "Owner address (defaults to signer[0])")
  .addOptionalParam("contract", "Override contract address")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const { ethers } = hre;

    const contractAddress = (taskArguments.contract as string | undefined) ?? (await hre.deployments.get("ConfidentialStorage")).address;
    const signer = (await ethers.getSigners())[0];
    const owner = (taskArguments.owner as string | undefined) ?? signer.address;

    const contract = await ethers.getContractAt("ConfidentialStorage", contractAddress);
    const files = await contract.getFiles(owner);

    console.log(`Found ${files.length} file(s) for ${owner}`);
    for (const file of files) {
      console.log({
        id: file.id.toString(),
        filename: file.filename,
        encryptedHash: file.encryptedHash,
        encryptedAccount: file.encryptedAccount,
        owner: file.owner,
        createdAt: file.createdAt.toString(),
      });
    }
  });
