import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';
import { ROLES } from '@/constants/roles';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('[POST /api/auth/google/callback] Token exchange failed:', error);
      return NextResponse.json({ error: 'Token exchange failed' }, { status: 401 });
    }

    const { access_token, id_token } = await tokenResponse.json();

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      console.error('[POST /api/auth/google/callback] User info fetch failed');
      return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 401 });
    }

    const googleUser = await userResponse.json();

    // Create or update user in MongoDB
    await dbConnect();

    // Determine role: admin if email matches ADMIN_EMAILS, otherwise user
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
    const role = adminEmails.includes(googleUser.email.toLowerCase()) ? ROLES.ADMIN : ROLES.USER;

    await User.findOneAndUpdate(
      { googleId: googleUser.id },
      {
        $set: {
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        },
        $setOnInsert: { role },
      },
      { upsert: true, new: true }
    );

    // Store authentication in cookie
    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };

    cookieStore.set('google_access_token', access_token, cookieOptions);
    cookieStore.set('google_id_token', id_token, cookieOptions);
    cookieStore.set('google_user_id', googleUser.id, cookieOptions);

    return NextResponse.json({
      success: true,
      user: {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      },
    });
  } catch (error) {
    console.error('[POST /api/auth/google/callback] Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
