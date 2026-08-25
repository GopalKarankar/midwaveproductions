import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from '@/lib/auth/session';

const ACCESS_COOKIE = 'mw_access';
const REFRESH_COOKIE = 'mw_refresh';

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60,
  path: '/',
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isProtectedPage = pathname.startsWith('/dashboard');

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const accessPayload = accessToken ? await verifyAccessToken(accessToken) : null;

  if (accessPayload) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const refreshPayload = refreshToken ? await verifyRefreshToken(refreshToken) : null;

  if (!refreshPayload || !refreshPayload.sub) {
    if (isProtectedPage) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }
    return NextResponse.next();
  }

  try {
    const newAccessToken = await signAccessToken({ sub: refreshPayload.sub });

    request.cookies.set(ACCESS_COOKIE, newAccessToken);
    const response = NextResponse.next({ request });

    response.cookies.set(ACCESS_COOKIE, newAccessToken, ACCESS_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error(`[middleware ${pathname}] Access token refresh failed:`, error);
    if (isProtectedPage) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
