import { NextRequest, NextResponse } from 'next/server';

interface RegisterRequest {
  name: string;
  username: string
  email: string;
  password: string;
  selectedPlan?: string;
  billingCycle?: 'monthly' | 'yearly';
}

interface JsonResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<JsonResponse>> {
  let body: Partial<RegisterRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const name = (body.name ?? '').trim();
  const username = (body.username ?? '').trim();
  const email = (body.email ?? '').trim();
  const password = (body.password ?? '').trim();
  const selectedPlan = body.selectedPlan || 'free-trial';
  const billingCycle = body.billingCycle || 'monthly';

  if (!name || !email || !password) {
    return NextResponse.json(
      { success: false, message: 'Name, email, and password are all required.' },
      { status: 400 }
    );
  }

  // Validate subscription plan
  const validPlans = ['free-trial', 'basic', 'pro', 'elite'];
  if (!validPlans.includes(selectedPlan)) {
    return NextResponse.json(
      { success: false, message: 'Invalid subscription plan selected.' },
      { status: 400 }
    );
  }

  // Validate billing cycle
  const validCycles = ['monthly', 'yearly'];
  if (!validCycles.includes(billingCycle)) {
    return NextResponse.json(
      { success: false, message: 'Invalid billing cycle selected.' },
      { status: 400 }
    );
  }

  try {
    // Get backend URL from environment variables
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: 'Backend URL not configured' },
        { status: 500 }
      );
    }

    // Use native fetch instead of http utility
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        selectedPlan,
        billingCycle
      }),
    });

    // Get the response data
    const data = await response.json() as { success: boolean; message?: string; data?: any };

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message ?? 'Registration failed.' },
        { status: response.status }
      );
    }

    // If registration successful and backend returns a token, set it as cookie
    if (data.data?.token) {
      const nextResponse = NextResponse.json(
        {
          success: true,
          message: data.message ?? 'Registration successful.',
          data: data.data
        },
        { status: response.status }
      );

      // Set secure HTTP-only cookie for authentication
      nextResponse.cookies.set('accessToken', data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      return nextResponse;
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message ?? 'Registration successful.',
        data: data.data
      },
      { status: response.status }
    );

  } catch (err: unknown) {
    console.error('Unexpected error in /api/auth/register:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
