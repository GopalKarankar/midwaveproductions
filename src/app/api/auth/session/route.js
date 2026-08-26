import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export async function GET(request) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'auth-session',
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!allowed) return rateLimitResponse(retryAfter);
  try {
    const { session, profile, blocked } = await getSession();

    if (!session) {
      if (blocked) {
        return NextResponse.json({ isAuthenticated: false, blocked: true }, { status: 403 });
      }
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
