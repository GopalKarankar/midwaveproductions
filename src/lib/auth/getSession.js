import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/auth/session";

// Server-side session + profile lookup for Route Handlers / Server Components.
// Tries access token first (fast path), then falls back to refresh token if the
// access token is missing/expired. The proxy layer (for /dashboard, /api routes)
// will silently refresh the access cookie on next request to those paths; this
// fallback ensures pages outside the proxy matcher (like /) don't misread an
// aged session as logged-out.
export async function getSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("mw_access")?.value;
  const refreshToken = cookieStore.get("mw_refresh")?.value;

  let payload = null;

  // Try access token first (1h lifetime)
  if (accessToken) {
    payload = await verifyAccessToken(accessToken);
  }

  // Fall back to refresh token (7d lifetime) if access token is missing/expired
  if (!payload && refreshToken) {
    payload = await verifyRefreshToken(refreshToken);
  }

  if (!payload || !payload.sub) {
    return { session: null, profile: null };
  }

  try {
    await dbConnect();
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return { session: null, profile: null };
    }

    if (user.isBlocked) {
      return { session: null, profile: null, blocked: true };
    }

    return {
      session: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      },
      profile: { roles: user.roles?.length ? user.roles : ["user"] },
    };
  } catch (error) {
    console.error("[getSession] JWT verification or MongoDB lookup failed:", error);
    return { session: null, profile: null };
  }
}
