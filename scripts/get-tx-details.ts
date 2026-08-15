import hre from "hardhat";

async function getTxDetails() {
  const { ethers } = hre;
  const contractAddress = "0xce1144770a0fA4f002fC23c70b00b45a9e7b94Db";
  const deployerAddress = "0x2D6bC01dd3A0Dd884D1A60913960C14AD190b99B";

  const currentBlock = await ethers.provider.getBlockNumber();
  console.log("Searching recent blocks starting from:", currentBlock);

  for (let b = currentBlock; b > currentBlock - 100; b--) {
    const block = await ethers.provider.getBlock(b, true);
    if (!block || !block.prefetchedTransactions) continue;
    for (const tx of block.prefetchedTransactions) {
      if (tx.from && tx.from.toLowerCase() === deployerAddress.toLowerCase()) {
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        if (receipt && receipt.contractAddress && receipt.contractAddress.toLowerCase() === contractAddress.toLowerCase()) {
          console.log("==========================================");
          console.log("Found Deployment Transaction!");
          console.log("Transaction Hash:", tx.hash);
          console.log("Block Number:", receipt.blockNumber);
          console.log("Gas Used:", receipt.gasUsed.toString());
          console.log("Effective Gas Price:", ethers.formatUnits(receipt.gasPrice, "gwei"), "gwei");
          const totalCost = receipt.gasUsed * receipt.gasPrice;
          console.log("Total Deployment Cost:", ethers.formatEther(totalCost), "MATIC");
          console.log("==========================================");
          return;
        }
      }
    }
  }
}

getTxDetails().catch(console.error);
