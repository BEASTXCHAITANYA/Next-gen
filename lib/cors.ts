import { NextResponse } from "next/server";

/**
 * FRONTEND_ORIGIN env var format: comma-separated list of allowed origins.
 * Examples:
 *   Single:   https://carbon-reef.vercel.app
 *   Multiple: https://carbon-reef.vercel.app,https://www.carbonreef.io
 *   Dev/any:  *
 *
 * If the incoming request origin matches any entry in the list, that origin
 * is echoed back (most permissive-safe approach). If there is no match, the
 * first entry in the list is used as the fallback.
 */
export function corsHeaders(origin?: string | null): HeadersInit {
  const raw = process.env.FRONTEND_ORIGIN || "*";

  if (raw === "*") {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }

  const allowlist = raw.split(",").map((o) => o.trim()).filter(Boolean);
  const matched = origin && allowlist.includes(origin) ? origin : allowlist[0];

  return {
    "Access-Control-Allow-Origin": matched,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

export function handleOptions(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}
