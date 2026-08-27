import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import Artist from "@/lib/mongodb/models/Artist";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import Booking from "@/lib/mongodb/models/Booking";
import { getSession } from "@/lib/auth/getSession";
import { requireRole } from "@/lib/auth/requireRole";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const PUBLIC_EXCLUDE = "-pressKit -managedBy -ownerId -__v";

// Fields that only an admin may set — silently stripped from any other caller's body.
const ADMIN_ONLY_FIELDS = ["isPublished", "isFeatured", "managedBy", "ownerId"];

// GET /api/artists/[id] — public
export const GET = withApiLog("artists-detail", async function GET(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'artists-detail',
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  const { id } = await params;

  try {
    await dbConnect();
    const artist = await Artist.findById(id).select(PUBLIC_EXCLUDE).lean();

    // 404, not a filtered-out response — don't leak the existence of drafts
    if (!artist || !artist.isPublished) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ artist });
  } catch (err) {
    console.error("[ROUTE GET /api/artists/[id]]", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
});

// PATCH /api/artists/[id] — owner, manager, or admin
export const PATCH = withApiLog("artists-update", async function PATCH(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'artists-update',
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  const { id } = await params;
  const { session, profile } = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile?.roles ?? [];

  try {
    await dbConnect();
    const artist = await Artist.findById(id);
    if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = artist.ownerId === session.user.id;
    const isPrivileged = profile?.roles?.some((r) => ["manager", "admin"].includes(r));

    if (!isOwner && !isPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    if (!profile?.roles?.includes("admin")) {
      for (const field of ADMIN_ONLY_FIELDS) delete body[field];
    }

    const updated = await Artist.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).select(PUBLIC_EXCLUDE + " isPublished isFeatured");

    return NextResponse.json({ artist: updated });
  } catch (err) {
    console.error("[ROUTE PATCH /api/artists/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// DELETE /api/artists/[id] — admin only
export const DELETE = withApiLog("artists-delete", async function DELETE(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'artists-delete',
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
    const artist = await Artist.findById(id);
    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const assets = await MediaAsset.find({ artistId: id });
    if (assets.length > 0) {
      const supabaseAdmin = createAdminClient();
      const { error: deleteError } = await supabaseAdmin.storage
        .from("media")
        .remove(assets.map((a) => a.storagePath));

      if (deleteError) {
        console.error("[ROUTE DELETE /api/artists/[id]] storage delete failed", deleteError);
        return NextResponse.json({ error: "Failed to delete media from storage" }, { status: 500 });
      }

      await MediaAsset.deleteMany({ artistId: id });
    }

    await Booking.deleteMany({ artistId: id });
    await Artist.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE DELETE /api/artists/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
