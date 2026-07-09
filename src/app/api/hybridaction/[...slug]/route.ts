import { NextResponse } from "next/server";

/**
 * Catch-all handler for /hybridaction/* requests.
 * These come from browser extensions (e.g. Zyb Tracker) that
 * blindly probe localhost:3000 — we just return 204 to silence
 * the 404 noise in the dev terminal.
 */
export async function GET() {
  return new NextResponse(null, { status: 204 });
}

export async function POST() {
  return new NextResponse(null, { status: 204 });
}
