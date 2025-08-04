import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  console.log("DYNAMIC TEST ROUTE HIT! ID:", params.id)
  return NextResponse.json({ message: "Dynamic route works!", id: params.id })
}
