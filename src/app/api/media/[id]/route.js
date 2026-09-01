import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import { requireRole } from "@/lib/auth/requireRole";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const STORAGE_BUCKET = "media";

export const DELETE = withApiLog("media-delete", async function DELETE(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'media-delete',
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

  const { id } = await params;

  try {
    await dbConnect();
    const asset = await MediaAsset.findById(id);

    if (!asset) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }

    if (asset.source !== "youtube") {
      const supabaseAdmin = createAdminClient();
      const { error: deleteError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .remove([asset.storagePath]);

      if (deleteError) {
        console.error("[ROUTE DELETE /api/media/[id]] storage delete failed", deleteError);
        return NextResponse.json({ error: "Failed to delete media from storage" }, { status: 500 });
      }
    }

    await MediaAsset.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE DELETE /api/media/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
