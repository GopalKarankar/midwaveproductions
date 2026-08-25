import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { verifyAccessToken } from "@/lib/auth/session";

// Server-side session + profile lookup for Route Handlers / Server Components.
// By the time this runs, middleware has already verified/refreshed the access
// token cookie for matched routes (/dashboard, /admin, /api/*) — this only
// needs to trust and verify the (already-fresh) access token, then look up
// the user's current role/profile in MongoDB.
export async function getSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("mw_access")?.value;

  if (!accessToken) {
    return { session: null, profile: null };
  }

  try {
    const payload = await verifyAccessToken(accessToken);

    if (!payload || !payload.sub) {
      return { session: null, profile: null };
    }

    await dbConnect();
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return { session: null, profile: null };
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
      profile: { role: user.role },
    };
  } catch (error) {
    console.error("[getSession] JWT verification or MongoDB lookup failed:", error);
    return { session: null, profile: null };
  }
}
