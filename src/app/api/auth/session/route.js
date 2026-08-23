import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const googleUserId = cookieStore.get('google_user_id')?.value;
    const accessToken = cookieStore.get('google_access_token')?.value;

    if (!googleUserId || !accessToken) {
      return NextResponse.json(null, { status: 401 });
    }

    // Fetch user info from Google to verify token is still valid
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      // Token might be expired, clear cookies
      return NextResponse.json(null, { status: 401 });
    }

    const googleUser = await userResponse.json();

    return NextResponse.json({
      user: {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      },
      isAuthenticated: true,
    });
  } catch (error) {
    console.error('[GET /api/auth/session] Error:', error);
    return NextResponse.json(null, { status: 401 });
  }
}
