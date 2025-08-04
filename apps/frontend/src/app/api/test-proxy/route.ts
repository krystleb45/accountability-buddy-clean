import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  console.log("🚨 TEST PROXY ROUTE HIT!")
  return NextResponse.json({
    message: "Test proxy works!",
    timestamp: new Date().toISOString(),
  })
}
