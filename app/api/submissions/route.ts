import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders, handleOptions } from "@/lib/cors";

export const maxDuration = 60;

export async function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    // 1. Validate wallet query parameter
    if (!wallet || typeof wallet !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(wallet.trim())) {
      return NextResponse.json(
        { error: "Validation failed: 'wallet' query parameter is required and must be a valid 0x-prefixed 40-character hex Ethereum address." },
        { status: 400, headers }
      );
    }

    const walletAddress = wallet.trim();

    // 2. Find User by wallet_address
    const user = await prisma.user.findUnique({
      where: { wallet_address: walletAddress },
    });

    if (!user) {
      return NextResponse.json({ submissions: [] }, { status: 200, headers });
    }

    // 3. Query Submissions joined with Credit table (tx_hash)
    const submissions = await prisma.submission.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      include: {
        credit: {
          select: {
            tx_hash: true,
          },
        },
      },
    });

    // 4. Format response fields with tx_hash (null if no Credit row)
    const formattedSubmissions = submissions.map((sub) => ({
      id: sub.id,
      photo_url: sub.photo_url,
      latitude: sub.latitude,
      longitude: sub.longitude,
      status: sub.status,
      verification_status: sub.verification_status,
      created_at: sub.created_at,
      tx_hash: sub.credit?.tx_hash ?? null,
    }));

    return NextResponse.json({ submissions: formattedSubmissions }, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Unexpected server error: ${err.message || String(err)}` },
      { status: 500, headers }
    );
  }
}
