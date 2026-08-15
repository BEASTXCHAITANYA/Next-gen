import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const { ethers } = hre;
  console.log("Deploying CarbonCredit contract to Polygon Amoy...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "MATIC");

  const CarbonCreditFactory = await ethers.getContractFactory("CarbonCredit");
  const contract = await CarbonCreditFactory.deploy();

  console.log("Transaction sent! Waiting for deployment block confirmation...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const tx = contract.deploymentTransaction();

  console.log("==========================================");
  console.log("CarbonCredit deployed successfully!");
  console.log("Contract Address:", address);
  if (tx) {
    console.log("Transaction Hash:", tx.hash);
    const receipt = await tx.wait();
    if (receipt) {
      console.log("Gas Used:", receipt.gasUsed.toString());
      console.log("Effective Gas Price:", ethers.formatUnits(receipt.gasPrice, "gwei"), "gwei");
      const actualCost = receipt.gasUsed * receipt.gasPrice;
      console.log("Actual Total Gas Cost:", ethers.formatEther(actualCost), "MATIC");
    }
  }
  console.log("==========================================");

  const outputPath = path.join(process.cwd(), "deployed-address.json");
  fs.writeFileSync(outputPath, JSON.stringify({ contractAddress: address, deployedAt: new Date().toISOString() }, null, 2));
  console.log("Saved deployed address to deployed-address.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
