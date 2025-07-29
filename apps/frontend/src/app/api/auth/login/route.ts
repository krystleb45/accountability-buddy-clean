// src/app/api/auth/login/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

interface LoginErrorResponse {
  message: string;
}

interface BackendLoginSuccess {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
interface BackendLoginFailure {
  success: false;
  message: string;
}
type BackendLoginResponse = BackendLoginSuccess | BackendLoginFailure;

interface BackendMeSuccess {
  success: true;
  data: {
    id: string;
    email: string;
    role: string;
    isAdmin: boolean;
    permissions: string[];
  };
}
interface BackendMeFailure {
  success: false;
  message: string;
}
type BackendMeResponse = BackendMeSuccess | BackendMeFailure;

// What NextAuth’s CredentialsProvider.authorize() expects
interface LoginSuccessResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  accessToken: string;
}

if (!process.env.BACKEND_URL) {
  throw new Error('Missing BACKEND_URL environment variable');
}
const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(
  req: NextRequest,
): Promise<NextResponse<LoginSuccessResponse> | NextResponse<LoginErrorResponse>> {
  // 1) Parse & validate incoming JSON
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
  }
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  // 2) Call backend login
  let accessToken: string;
  try {
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginBody = (await loginRes.json()) as BackendLoginResponse;
    if (!loginRes.ok || !loginBody.success) {
      return NextResponse.json(
        { message: loginBody.success === false ? loginBody.message : 'Invalid credentials' },
        { status: loginRes.status },
      );
    }
    accessToken = loginBody.data.accessToken;
  } catch (err) {
    console.error('[login] Error during login call:', err);
    return NextResponse.json({ message: 'Login service unavailable' }, { status: 502 });
  }

  // 3) Fetch user info (“/me”)
  let meData: BackendMeSuccess['data'];
  try {
    const meRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meBody = (await meRes.json()) as BackendMeResponse;
    if (!meRes.ok || !meBody.success) {
      return NextResponse.json(
        { message: meBody.success === false ? meBody.message : 'Failed to fetch user info' },
        { status: meRes.status },
      );
    }
    meData = meBody.data;
  } catch (err) {
    console.error('[login] Error fetching /me:', err);
    return NextResponse.json({ message: 'User info service unavailable' }, { status: 502 });
  }

  // 4) Return NextAuth shape
  const out: LoginSuccessResponse = {
    id: meData.id,
    name: meData.email, // or meData.name if your backend returns it
    email: meData.email,
    role: meData.role,
    accessToken,
  };

  return NextResponse.json(out);
}
