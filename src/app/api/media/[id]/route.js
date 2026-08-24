import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import { requireRole } from "@/lib/auth/requireRole";
import { createClient as createAdminClient } from "@/lib/supabase/admin";

const STORAGE_BUCKET = "media";

export async function DELETE(request, { params }) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;

  try {
    await dbConnect();
    const asset = await MediaAsset.findById(id);

    if (!asset) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }

    const supabaseAdmin = createAdminClient();
    const { error: deleteError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([asset.storagePath]);

    if (deleteError) {
      console.error("[ROUTE DELETE /api/media/[id]] storage delete failed", deleteError);
      return NextResponse.json({ error: "Failed to delete media from storage" }, { status: 500 });
    }

    await MediaAsset.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE DELETE /api/media/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
