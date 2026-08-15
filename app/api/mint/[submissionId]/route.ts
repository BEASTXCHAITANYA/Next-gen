import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, handleOptions } from "@/lib/cors";
import prisma from "@/lib/prisma";
import { ethers } from "ethers";

const MINIMAL_ABI = [
  "function mintCredit(address to, string memory uri) external returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

export async function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const { submissionId } = params;
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    // 1. Load Submission by submissionId (including user and credit relations)
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: true,
        credit: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: `Submission '${submissionId}' not found.` },
        { status: 404, headers }
      );
    }

    // 2. Return 400 if submission status is not "verified"
    if (submission.status !== "verified") {
      return NextResponse.json(
        {
          error: `Submission '${submissionId}' cannot be minted because its status is '${submission.status}' (must be 'verified').`,
        },
        { status: 400, headers }
      );
    }

    // 3. Check for existing Credit row for this submission (idempotent double-mint protection)
    if (submission.credit) {
      const explorer_url = submission.credit.tx_hash
        ? `https://amoy.polygonscan.com/tx/${submission.credit.tx_hash}`
        : null;

      return NextResponse.json(
        {
          token_id: submission.credit.token_id,
          tx_hash: submission.credit.tx_hash,
          explorer_url,
        },
        { status: 200, headers }
      );
    }

    // Check environment variables
    const rpcUrl = process.env.ALCHEMY_RPC_URL;
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      return NextResponse.json(
        { error: "Server blockchain configuration missing in environment." },
        { status: 500, headers }
      );
    }

    // 4. Server-side wallet setup
    const formattedPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(formattedPrivateKey, provider);

    // Fail early if deployer balance is too low (< 0.001 MATIC)
    const balance = await provider.getBalance(wallet.address);
    if (balance < ethers.parseEther("0.001")) {
      return NextResponse.json(
        {
          error: `Deployer wallet '${wallet.address}' has insufficient funds (${ethers.formatEther(balance)} MATIC) to cover minting gas fees.`,
        },
        { status: 500, headers }
      );
    }

    const contract = new ethers.Contract(contractAddress, MINIMAL_ABI, wallet);

    // Call mintCredit(address to, string uri)
    const tx = await contract.mintCredit(submission.user.wallet_address, submission.photo_url);

    // 5. Wait for block confirmation
    const receipt = await tx.wait();

    if (!receipt || receipt.status !== 1) {
      return NextResponse.json(
        { error: "Mint transaction failed or reverted on-chain." },
        { status: 500, headers }
      );
    }

    // Parse Transfer event for token_id
    let tokenIdStr: string | null = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsedLog && parsedLog.name === "Transfer") {
          tokenIdStr = parsedLog.args.tokenId.toString();
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }

    if (!tokenIdStr) {
      for (const log of receipt.logs) {
        if (log.topics[0] === ethers.id("Transfer(address,address,uint256)")) {
          tokenIdStr = BigInt(log.topics[3]).toString();
          break;
        }
      }
    }

    if (!tokenIdStr) {
      return NextResponse.json(
        { error: "Could not parse token ID from mint transaction receipt." },
        { status: 500, headers }
      );
    }

    // 6. Create Credit record in database
    const credit = await prisma.credit.create({
      data: {
        submission_id: submission.id,
        token_id: tokenIdStr,
        tx_hash: receipt.hash,
      },
    });

    const explorer_url = `https://amoy.polygonscan.com/tx/${receipt.hash}`;

    // 7. Return 200 JSON
    return NextResponse.json(
      {
        token_id: credit.token_id,
        tx_hash: credit.tx_hash,
        explorer_url,
      },
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("[Mint Route Error]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during minting." },
      { status: 500, headers }
    );
  }
}
