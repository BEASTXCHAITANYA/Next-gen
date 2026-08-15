import { NextResponse } from "next/server";

export function corsHeaders(origin?: string | null): HeadersInit {
  const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": origin && (allowedOrigin === "*" || allowedOrigin === origin) ? origin : allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function handleOptions(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}
