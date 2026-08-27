import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { ROLES } from "@/constants/roles";
import { signAccessToken, signRefreshToken } from "@/lib/auth/session";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

function getDeviceKey(userAgent) {
  return userAgent
    .replace(/[\d.]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export async function GET(request) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: "auth-callback",
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed) return rateLimitResponse(retryAfter);

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();

  // console.log("cookieStore : ",cookieStore);

  // Handle error from Google
  if (error) {
    console.error('[GET /auth/callback] Google OAuth error:', error);
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }

  if (!code || !state) {
    console.error('[GET /auth/callback] Missing code or state');
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }

  try {
    // CSRF protection: validate state against cookie
    const oauthState = cookieStore.get("oauth_state")?.value;

    if (!oauthState || oauthState !== state) {
      console.error('[GET /auth/callback] CSRF state mismatch');
      cookieStore.delete("oauth_state");
      return NextResponse.redirect(`${origin}/?error=invalid_state`);
    }

    // Delete state cookie (single-use)
    cookieStore.delete("oauth_state");

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${origin}/auth/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('[GET /auth/callback] Token exchange failed:', error);
      return NextResponse.redirect(
        `${origin}/?error=token_exchange_failed`
      );
    }

    const { access_token } = await tokenResponse.json();

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      console.error('[GET /auth/callback] User info fetch failed');
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }

    const googleUser = await userResponse.json();

    // Create or update user in MongoDB
    await dbConnect();

    const user = await User.findOneAndUpdate(
      { $or: [{ googleId: googleUser.id }, { email: googleUser.email.toLowerCase() }] },
      {
        $set: {
          googleId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        },
        $setOnInsert: { roles: [ROLES.USER] },
      },
      { upsert: true, new: true }
    );

    // Reject blocked users — redirect without issuing tokens
    if (user.isBlocked) {
      return NextResponse.redirect(`${origin}/?blocked=1`);
    }

    // Record device/user-agent details
    const userAgent = request.headers.get("user-agent") || "unknown";
    const deviceKey = getDeviceKey(userAgent);
    const ip = getClientIp(request);
    const now = new Date();

    try {
      const updated = await User.updateOne(
        { _id: user._id, "devices.deviceKey": deviceKey },
        {
          $set: { "devices.$.userAgent": userAgent, "devices.$.lastSeenAt": now, "devices.$.ip": ip },
          $inc: { "devices.$.loginCount": 1 },
        }
      );

      if (updated.matchedCount === 0) {
        await User.updateOne(
          { _id: user._id },
          {
            $push: {
              devices: {
                $each: [{ deviceKey, userAgent, ip, firstSeenAt: now, lastSeenAt: now, loginCount: 1 }],
                $slice: -20,
              },
            },
          }
        );
      }
    } catch (deviceErr) {
      // Never block login on device-tracking failure
      console.error("[GET /auth/callback] Failed to record device", {
        userId: user._id.toString(),
        email: user.email,
        message: deviceErr.message,
      });
    }

    // Sign and set access + refresh token cookies
    const accessToken = await signAccessToken({ sub: user._id.toString() });
    const refreshToken = await signRefreshToken({ sub: user._id.toString() });

    const baseCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    cookieStore.set("mw_access", accessToken, {
      ...baseCookieOptions,
      maxAge: 60 * 60, // 1 hour
    });
    cookieStore.set("mw_refresh", refreshToken, {
      ...baseCookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Redirect to dashboard on successful authentication
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (err) {
    console.error('[GET /auth/callback] Error:', err);
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }
}
