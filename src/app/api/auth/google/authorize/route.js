import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { withApiLog } from '@/lib/monitoring/withApiLog';

export const GET = withApiLog('auth-google-authorize', async function GET(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'auth-google-authorize',
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;
    const scope = 'openid profile email';
    const responseType = 'code';

    const state = crypto.randomUUID();

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: responseType,
      scope,
      access_type: 'offline',
      state,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    };

    cookieStore.set('oauth_state', state, cookieOptions);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[GET /api/auth/google/authorize] Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/?error=auth_failed`);
  }
});
