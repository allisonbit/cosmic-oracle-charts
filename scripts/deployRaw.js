import fs from 'fs';
import { JsonRpcProvider, Wallet, ContractFactory } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function main() {
  const artifactPath = path.resolve('artifacts/contracts/OracleBullPayments.sol/OracleBullPayments.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const provider = new JsonRpcProvider(process.env.RPC_URL || 'https://mainnet.base.org');
  let pk = process.env.PRIVATE_KEY;
  if (pk && !pk.startsWith('0x')) {
    pk = '0x' + pk;
  }
  
  if (!pk) {
    throw new Error("Missing PRIVATE_KEY in .env");
  }

  const wallet = new Wallet(pk, provider);
  console.log(`Deploying from account: ${wallet.address}`);
  console.log(`Using RPC: ${process.env.RPC_URL}`);

  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
  
  console.log("Deploying contract...");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(`✅ OracleBullPayments deployed to: ${address}`);
}

main().catch(console.error);
