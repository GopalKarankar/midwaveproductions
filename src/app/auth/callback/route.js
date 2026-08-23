import { NextResponse } from "next/server";

// Google OAuth callback handler
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Handle error from Google
  if (error) {
    console.error('[GET /auth/callback] Google OAuth error:', error);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  if (code) {
    try {
      // Exchange code for tokens via our backend endpoint
      const tokenResponse = await fetch(`${origin}/api/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('[GET /auth/callback] Token exchange failed:', errorData);
        return NextResponse.redirect(`${origin}/login?error=token_exchange_failed`);
      }

      const result = await tokenResponse.json();

      // Redirect to dashboard on successful authentication
      return NextResponse.redirect(`${origin}/dashboard`);
    } catch (err) {
      console.error('[GET /auth/callback] Error:', err);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
