import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import Artist from "@/lib/mongodb/models/Artist";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import { requireRole } from "@/lib/auth/requireRole";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { MIME_RULES } from "@/lib/media/mimeRules";
import { withApiLog } from "@/lib/monitoring/withApiLog";
import { extractYoutubeVideoId } from "@/lib/media/parseYoutubeUrl";

const STORAGE_BUCKET = "media";

// POST /api/media/upload — manager or admin
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

  const { error, session, profile } = await requireRole("manager");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  try {
    await dbConnect();
    const formData = await request.formData();
    const file = formData.get("file");
    const youtubeUrl = formData.get("youtubeUrl");
    const artistId = formData.get("artistId");
    const label = formData.get("label");

    const hasFile = file && typeof file !== "string";
    const hasYoutubeUrl = youtubeUrl && typeof youtubeUrl === "string" && youtubeUrl.trim();

    if ((hasFile && hasYoutubeUrl) || (!hasFile && !hasYoutubeUrl)) {
      return NextResponse.json(
        { error: "Provide either a file or a YouTube link, not both" },
        { status: 400 }
      );
    }

    // Non-admin managers can only upload media for artists they manage
    if (!profile?.roles?.includes("admin") && artistId) {
      const owned = await Artist.exists({ _id: artistId, managedBy: session.user.id });
      if (!owned) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (hasFile) {
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
      const asset = await MediaAsset.create({
        artistId: artistId || undefined,
        uploadedBy: session.user.id,
        type: rule.type,
        source: "upload",
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
    } else {
      const videoId = extractYoutubeVideoId(youtubeUrl);
      if (!videoId) {
        return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
      }

      const asset = await MediaAsset.create({
        artistId: artistId || undefined,
        uploadedBy: session.user.id,
        type: "video",
        source: "youtube",
        url: youtubeUrl,
        youtubeVideoId: videoId,
        label: label || undefined,
      });

      return NextResponse.json({ asset }, { status: 201 });
    }
  } catch (err) {
    console.error("[ROUTE POST /api/media/upload]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
