import hre from "hardhat";

async function main() {
  const contractFactory = await hre.ethers.getContractFactory("OracleBullPayments");
  console.log("Deploying OracleBullPayments...");
  
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  
  console.log("OracleBullPayments deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
