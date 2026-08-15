import "dotenv/config";
import { ethers } from "ethers";

// Reproduces the exact provider construction used in
// app/api/mint/[submissionId]/route.ts, isolated from the mint route's other
// logic (env checks, wallet, contract calls). If this fails the same way,
// the problem is the RPC endpoint/provider construction, not minting.
async function testRpc() {
  const rpcUrl = process.env.ALCHEMY_RPC_URL;

  if (!rpcUrl) {
    console.error("ALCHEMY_RPC_URL is not set.");
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl, 80002, {
    staticNetwork: true,
    batchMaxCount: 1,
  });

  try {
    const blockNumber = await provider.getBlockNumber();
    console.log("RPC call succeeded. Current block number:", blockNumber);
  } catch (err) {
    console.error("RPC call failed:", err);
  }
}

testRpc();
