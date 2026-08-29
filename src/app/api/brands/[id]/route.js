import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import Brand from "@/lib/mongodb/models/Brand";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import { requireRole } from "@/lib/auth/requireRole";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const EDITABLE_FIELDS = ["name", "logoUrl", "websiteUrl", "isActive", "isFeatured"];

export const PATCH = withApiLog("brands-update", async function PATCH(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "brands-update", limit: 20, windowMs: 5 * 60 * 1000 });
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
    const brand = await Brand.findById(id);
    if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    const body = await request.json();
    const update = {};

    for (const field of EDITABLE_FIELDS) {
      if (!(field in body)) continue;
      if (field === "websiteUrl") {
        if (body.websiteUrl?.trim()) {
          const urlRegex = /^https?:\/\/.+/i;
          if (!urlRegex.test(body.websiteUrl.trim())) {
            return NextResponse.json({ error: "websiteUrl must be a valid URL" }, { status: 400 });
          }
          update.websiteUrl = body.websiteUrl.trim();
        } else {
          update.websiteUrl = undefined;
        }
      } else if (field === "name") {
        update.name = String(body.name).trim();
      } else {
        update[field] = body[field];
      }
    }

    const updated = await Brand.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ brand: updated });
  } catch (err) {
    console.error("[ROUTE PATCH /api/brands/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const DELETE = withApiLog("brands-delete", async function DELETE(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "brands-delete", limit: 20, windowMs: 5 * 60 * 1000 });
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
    const brand = await Brand.findById(id);
    if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    if (brand.logoUrl) {
      const asset = await MediaAsset.findOne({ url: brand.logoUrl });
      if (asset) {
        const supabaseAdmin = createAdminClient();
        const { error: deleteError } = await supabaseAdmin.storage.from("media").remove([asset.storagePath]);
        if (deleteError) {
          console.error("[ROUTE DELETE /api/brands/[id]] storage delete failed", deleteError);
          return NextResponse.json({ error: "Failed to delete logo from storage" }, { status: 500 });
        }
        await MediaAsset.findByIdAndDelete(asset._id);
      }
    }

    await Brand.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE DELETE /api/brands/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
