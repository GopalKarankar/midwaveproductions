import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb/connect";
import PricingTier from "@/lib/mongodb/models/PricingTier";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const EDITABLE_FIELDS = ["name", "price", "description", "features", "order", "isActive"];

export const PATCH = withApiLog("pricing-tiers-update", async function PATCH(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "pricing-tiers-update", limit: 20, windowMs: 5 * 60 * 1000 });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  const { id } = await params;

  try {
    await dbConnect();
    const tier = await PricingTier.findById(id);
    if (!tier) return NextResponse.json({ error: "Pricing tier not found" }, { status: 404 });

    const body = await request.json();
    const update = {};

    for (const field of EDITABLE_FIELDS) {
      if (!(field in body)) continue;

      if (field === "name") {
        update.name = String(body.name).trim();
      } else if (field === "price") {
        update.price = String(body.price).trim();
      } else if (field === "description") {
        update.description = body.description?.trim() || undefined;
      } else if (field === "features") {
        if (Array.isArray(body.features)) {
          update.features = body.features
            .map(f => (f || "").toString().trim())
            .filter(Boolean);
        }
      } else if (field === "order") {
        update.order = Number(body.order) || 0;
      } else if (field === "isActive") {
        update.isActive = Boolean(body.isActive);
      }
    }

    const updated = await PricingTier.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    revalidatePath("/pricing");

    return NextResponse.json({ tier: updated });
  } catch (err) {
    console.error("[ROUTE PATCH /api/pricing-tiers/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const DELETE = withApiLog("pricing-tiers-delete", async function DELETE(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "pricing-tiers-delete", limit: 20, windowMs: 5 * 60 * 1000 });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  const { id } = await params;

  try {
    await dbConnect();
    const tier = await PricingTier.findById(id);
    if (!tier) return NextResponse.json({ error: "Pricing tier not found" }, { status: 404 });

    await PricingTier.findByIdAndDelete(id);
    revalidatePath("/pricing");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE DELETE /api/pricing-tiers/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
