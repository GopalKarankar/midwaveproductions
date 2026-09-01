import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { getSession } from "@/lib/auth/getSession";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

export const PATCH = withApiLog("users-me-update", async function PATCH(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: "users-me-update",
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  const { session, profile } = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile?.roles ?? [];

  try {
    const body = await request.json();

    // Only name and picture are ever read from body — roles/email/isBlocked/blockedAt/blockedBy/blockReason/devices/googleId
    // are never referenced, so they can't be smuggled in regardless of what the client sends.
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const picture = typeof body.picture === "string" ? body.picture.trim() : undefined;

    if (name !== undefined && (name.length === 0 || name.length > 100)) {
      return NextResponse.json({ error: "Name must be 1-100 characters." }, { status: 400 });
    }

    if (picture !== undefined && picture.length > 0) {
      if (picture.length > 2000) {
        return NextResponse.json({ error: "Picture URL is too long." }, { status: 400 });
      }
      try {
        new URL(picture);
      } catch {
        return NextResponse.json({ error: "Picture must be a valid URL." }, { status: 400 });
      }
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (picture !== undefined) update.picture = picture;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    await dbConnect();
    const updated = await User.findByIdAndUpdate(session.user.id, update, {
      new: true,
      runValidators: true,
    }).select("name picture email roles");

    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      user: { name: updated.name, picture: updated.picture, email: updated.email, roles: updated.roles },
    });
  } catch (err) {
    console.error("[ROUTE PATCH /api/users/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
