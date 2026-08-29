import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb/connect";
import PricingTier from "@/lib/mongodb/models/PricingTier";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const PUBLIC_LIST_SELECT = "name price description features order";

export const GET = withApiLog("pricing-tiers-list", async function GET(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "pricing-tiers-list", limit: 30, windowMs: 60 * 1000 });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  try {
    await dbConnect();
    const tiers = await PricingTier.find({ isActive: true })
      .select(PUBLIC_LIST_SELECT)
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({ tiers });
  } catch (err) {
    console.error("[ROUTE GET /api/pricing-tiers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const POST = withApiLog("pricing-tiers-create", async function POST(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "pricing-tiers-create", limit: 20, windowMs: 5 * 60 * 1000 });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  try {
    await dbConnect();
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    if (!body.price?.trim()) {
      return NextResponse.json({ error: "price is required" }, { status: 400 });
    }

    const features = Array.isArray(body.features)
      ? body.features.map(f => (f || "").toString().trim()).filter(Boolean)
      : [];

    const tier = await PricingTier.create({
      name: body.name.trim(),
      price: body.price.trim(),
      description: body.description?.trim() || undefined,
      features,
      order: Number(body.order) || 0,
      isActive: Boolean(body.isActive !== false),
    });

    revalidatePath("/pricing");

    return NextResponse.json({ tier }, { status: 201 });
  } catch (err) {
    console.error("[ROUTE POST /api/pricing-tiers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
