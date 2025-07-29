// src/app/api/goal-message/[goalId]/messages/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error('Missing BACKEND_URL')

export async function GET(_request: Request, { params }: { params: { goalId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { goalId } = params

  const resp = await fetch(
    `${BACKEND_URL}/api/goal-message/${encodeURIComponent(goalId)}/messages`,
    {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    }
  )

  if (!resp.ok) {
    const txt = await resp.text()
    console.error('Upstream /goal-message/messages error:', txt)
    return NextResponse.json({ error: txt || 'Upstream error' }, { status: resp.status })
  }

  const data = await resp.json()
  return NextResponse.json(data)
}
