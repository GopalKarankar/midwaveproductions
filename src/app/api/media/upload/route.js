import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import { requireRole } from "@/lib/auth/requireRole";
import { createClient as createAdminClient } from "@/lib/supabase/admin";

const STORAGE_BUCKET = "media";

// Allow-list keyed to MediaAsset.type — never trust a client-declared type.
const MIME_RULES = {
  "image/jpeg": { type: "image", maxSize: 10 * 1024 * 1024 },
  "image/png": { type: "image", maxSize: 10 * 1024 * 1024 },
  "image/webp": { type: "image", maxSize: 10 * 1024 * 1024 },
  "audio/mpeg": { type: "audio", maxSize: 50 * 1024 * 1024 },
  "audio/wav": { type: "audio", maxSize: 50 * 1024 * 1024 },
  "video/mp4": { type: "video", maxSize: 200 * 1024 * 1024 },
  "application/pdf": { type: "document", maxSize: 15 * 1024 * 1024 },
};

// POST /api/media/upload — artist, manager, or admin
export async function POST(request) {
  const { error, session } = await requireRole("artist");
  if (error) return error;

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
}
