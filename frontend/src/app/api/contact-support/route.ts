// File: src/app/api/contact-support/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

interface ContactSupportRequest {
  name: string;
  email: string;
  message: string;
}

interface JsonResponse {
  success: boolean;
  message: string;
}

if (!process.env.BACKEND_URL) {
  throw new Error('Missing BACKEND_URL environment variable');
}
const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(
  req: NextRequest
): Promise<NextResponse<JsonResponse>> {
  let body: ContactSupportRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const { name, email, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { success: false, message: 'Name, email, and message are all required' },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(`${BACKEND_URL}/api/support/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const errMsg =
        typeof data === 'object' && 'message' in data
          ? (data as { message: string }).message
          : 'Failed to send message';
      return NextResponse.json(
        { success: false, message: errMsg },
        { status: upstream.status }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Your message has been sent. We’ll be in touch soon!' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[contact-support] network error:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to reach support service at this time',
      },
      { status: 502 }
    );
  }
}
