import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import { requireRole } from "@/lib/auth/requireRole";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { MIME_RULES } from "@/lib/media/mimeRules";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const STORAGE_BUCKET = "media";

// POST /api/media/upload — admin only
export const POST = withApiLog("media-upload", async function POST(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'media-upload',
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
    const formData = await request.formData();
    const file = formData.get("file");
    const artistId = formData.get("artistId");
    const label = formData.get("label");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const rule = MIME_RULES[file.type];
    if (!rule) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    if (file.size > rule.maxSize) {
      return NextResponse.json(
        { error: `File exceeds the ${rule.maxSize / (1024 * 1024)}MB limit for this type` },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const extension = file.name?.split(".").pop() || "bin";
    const storagePath = `${session.user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { contentType: file.type });

    if (uploadError) {
      console.error("[ROUTE POST /api/media/upload] storage upload failed", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    await dbConnect();
    const asset = await MediaAsset.create({
      artistId: artistId || undefined,
      uploadedBy: session.user.id,
      type: rule.type,
      // url/storagePath are always derived from the actual upload result,
      // never taken from the client body.
      url: publicUrl,
      storagePath,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      label: label || undefined,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (err) {
    console.error("[ROUTE POST /api/media/upload]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
