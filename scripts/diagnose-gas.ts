import hre from "hardhat";

async function diagnose() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  console.log("=== Deployer Wallet Information ===");
  console.log("Address:", deployer.address);

  const balanceWei = await ethers.provider.getBalance(deployer.address);
  console.log("Balance (Wei):", balanceWei.toString());
  console.log("Balance (MATIC):", ethers.formatEther(balanceWei));

  const feeData = await ethers.provider.getFeeData();
  console.log("\n=== Network Fee Data (Polygon Amoy) ===");
  console.log("gasPrice:", feeData.gasPrice ? `${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei (${feeData.gasPrice.toString()} wei)` : "N/A");
  console.log("maxFeePerGas:", feeData.maxFeePerGas ? `${ethers.formatUnits(feeData.maxFeePerGas, "gwei")} gwei (${feeData.maxFeePerGas.toString()} wei)` : "N/A");
  console.log("maxPriorityFeePerGas:", feeData.maxPriorityFeePerGas ? `${ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei")} gwei (${feeData.maxPriorityFeePerGas.toString()} wei)` : "N/A");

  const CarbonCreditFactory = await ethers.getContractFactory("CarbonCredit");
  const deployTx = await CarbonCreditFactory.getDeployTransaction();
  const estimatedGasLimit = await ethers.provider.estimateGas(deployTx);
  console.log("\n=== Contract Gas Estimate ===");
  console.log("Estimated Gas Limit (units):", estimatedGasLimit.toString());

  const effectiveGasPrice = feeData.maxFeePerGas ?? feeData.gasPrice ?? 0n;
  const totalCostWei = estimatedGasLimit * effectiveGasPrice;
  console.log("\n=== Deployment Cost Calculation ===");
  console.log("Total Estimated Tx Cost (Wei):", totalCostWei.toString());
  console.log("Total Estimated Tx Cost (MATIC):", ethers.formatEther(totalCostWei));
  console.log("Deficit (MATIC):", balanceWei < totalCostWei ? ethers.formatEther(totalCostWei - balanceWei) : "0 (Sufficient)");
}

diagnose().catch(console.error);
