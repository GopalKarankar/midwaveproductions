import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import Brand from "@/lib/mongodb/models/Brand";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const PUBLIC_LIST_SELECT = "name logoUrl websiteUrl isFeatured";

export const GET = withApiLog("brands-list", async function GET(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "brands-list", limit: 30, windowMs: 60 * 1000 });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  try {
    await dbConnect();
    const brands = await Brand.find({ isActive: true })
      .select(PUBLIC_LIST_SELECT)
      .sort({ isFeatured: -1, name: 1 })
      .lean();

    return NextResponse.json({ brands });
  } catch (err) {
    console.error("[ROUTE GET /api/brands]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const POST = withApiLog("brands-create", async function POST(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "brands-create", limit: 20, windowMs: 5 * 60 * 1000 });
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

    if (body.websiteUrl?.trim()) {
      const urlRegex = /^https?:\/\/.+/i;
      if (!urlRegex.test(body.websiteUrl.trim())) {
        return NextResponse.json({ error: "websiteUrl must be a valid URL" }, { status: 400 });
      }
    }

    const brand = await Brand.create({
      name: body.name.trim(),
      logoUrl: body.logoUrl || undefined,
      websiteUrl: body.websiteUrl?.trim() || undefined,
      isActive: Boolean(body.isActive),
      isFeatured: Boolean(body.isFeatured),
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (err) {
    console.error("[ROUTE POST /api/brands]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
