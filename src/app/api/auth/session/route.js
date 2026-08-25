import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';

export async function GET() {
  try {
    const { session, profile } = await getSession();

    if (!session) {
      return NextResponse.json(null, { status: 401 });
    }

    return NextResponse.json({
      user: session.user,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error('[GET /api/auth/session] Error:', error);
    return NextResponse.json(null, { status: 401 });
  }
}
