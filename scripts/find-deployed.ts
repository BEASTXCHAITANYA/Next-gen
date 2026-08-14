import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function findDeployed() {
  const { ethers } = hre;
  const deployerAddress = "0x2D6bC01dd3A0Dd884D1A60913960C14AD190b99B";
  
  const nonce = await ethers.provider.getTransactionCount(deployerAddress);
  console.log("Deployer Nonce:", nonce);

  // If nonce > 0, the last transaction created contract at nonce - 1
  if (nonce > 0) {
    const contractAddress = ethers.getCreateAddress({ from: deployerAddress, nonce: nonce - 1 });
    console.log("=== Deployed Contract Details ===");
    console.log("Contract Address:", contractAddress);

    // Check code at address
    const code = await ethers.provider.getCode(contractAddress);
    console.log("Code Size at Address:", code.length);

    // Get block number
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("Current Block Number:", blockNumber);

    // Write deployed-address.json
    const outputPath = path.join(process.cwd(), "deployed-address.json");
    fs.writeFileSync(outputPath, JSON.stringify({ contractAddress, deployer: deployerAddress, deployedAt: new Date().toISOString() }, null, 2));
    console.log("Wrote deployed-address.json successfully!");
  }
}

findDeployed().catch(console.error);
