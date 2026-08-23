import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";

// Server-side session + profile lookup for Route Handlers / Server Components.
// Reads from MongoDB via httpOnly Google OAuth cookie.
export async function getSession() {
  const cookieStore = await cookies();
  const googleUserId = cookieStore.get("google_user_id")?.value;

  if (!googleUserId) {
    return { session: null, profile: null };
  }

  try {
    await dbConnect();
    const user = await User.findOne({ googleId: googleUserId }).lean();

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
    console.error("[getSession] MongoDB lookup failed:", error);
    return { session: null, profile: null };
  }
}
