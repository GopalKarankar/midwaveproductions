import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb/connect";
import SiteSettings from "@/lib/mongodb/models/SiteSettings";
import { requireRole } from "@/lib/auth/requireRole";
import { LEGAL_PAGE_KEYS } from "@/constants/legalPages";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

export const PATCH = withApiLog("settings-legal", async function PATCH(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: "settings-legal",
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
      if (!LEGAL_PAGE_KEYS.includes(key)) continue;
      const value = body[key];
      setOps[`legalPages.${key}`] = typeof value === "string" ? value.trim() : "";
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
    revalidatePath("/terms");
    revalidatePath("/privacy");
    revalidatePath("/about");

    return NextResponse.json({ success: true, legalPages: updated.legalPages });
  } catch (err) {
    console.error("[ROUTE PATCH /api/settings/legal]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
