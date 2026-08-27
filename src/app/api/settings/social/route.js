import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb/connect";
import SiteSettings from "@/lib/mongodb/models/SiteSettings";
import { requireRole } from "@/lib/auth/requireRole";
import { SOCIAL_PLATFORM_KEYS } from "@/constants/socialPlatforms";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

export const PATCH = withApiLog("settings-social", async function PATCH(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: "settings-social",
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  try {
    const body = await request.json();

    const setOps = {};
    for (const key of Object.keys(body)) {
      if (!SOCIAL_PLATFORM_KEYS.includes(key)) continue;
      const value = body[key];
      setOps[`socialLinks.${key}`] = typeof value === "string" ? value.trim() : "";
    }
    if (Object.keys(setOps).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await dbConnect();
    const updated = await SiteSettings.findOneAndUpdate(
      {},
      { $set: setOps },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, socialLinks: updated.socialLinks });
  } catch (err) {
    console.error("[ROUTE PATCH /api/settings/social]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
