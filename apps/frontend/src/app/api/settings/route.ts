// src/app/api/settings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BACKEND_URL = process.env.BACKEND_URL!;
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL");

/**
 * GET /api/settings
 *   — proxy to GET BACKEND_URL/api/settings
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // forward any query string
  const { search } = new URL(req.url);
  const upstream = await fetch(`${BACKEND_URL}/api/settings${search}`, {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
      cookie: req.headers.get("cookie") ?? "",
    },
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error("[settings][GET] upstream error:", text);
    return NextResponse.json(
      { error: text || "Upstream error" },
      { status: upstream.status }
    );
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * PUT /api/settings/update
 *   — proxy to PUT BACKEND_URL/api/settings/update
 */
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  let clientBody: Record<string, unknown>;
  try {
    clientBody = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const upstream = await fetch(`${BACKEND_URL}/api/settings/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.accessToken}`,
      cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(clientBody),
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error("[settings][PUT] upstream error:", text);
    return NextResponse.json(
      { success: false, message: text || "Upstream error" },
      { status: upstream.status }
    );
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}
