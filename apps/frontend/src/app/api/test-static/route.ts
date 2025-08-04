import { NextResponse } from "next/server"

export async function GET() {
  console.log("STATIC TEST ROUTE HIT!")
  return NextResponse.json({ message: "Static route works!" })
}
