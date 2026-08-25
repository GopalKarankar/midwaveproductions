import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { verifySessionToken } from "@/lib/auth/session";

// Server-side session + profile lookup for Route Handlers / Server Components.
// Reads and verifies the signed mw_session JWT, then looks up the user in MongoDB.
export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("mw_session")?.value;

  if (!sessionToken) {
    return { session: null, profile: null };
  }

  try {
    const payload = await verifySessionToken(sessionToken);

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
