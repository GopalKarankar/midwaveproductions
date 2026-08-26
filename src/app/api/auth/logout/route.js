import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export async function POST(request) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'auth-logout',
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed) return rateLimitResponse(retryAfter);
  try {
    const cookieStore = await cookies();

    // Clear session cookies (and any stale pre-migration cookie)
    cookieStore.delete('mw_access');
    cookieStore.delete('mw_refresh');
    cookieStore.delete('mw_session'); // defensive: clear legacy cookie if still present
    cookieStore.delete('oauth_state');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/auth/logout] Error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
