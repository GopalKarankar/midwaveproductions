import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import Artist from "@/lib/mongodb/models/Artist";
import { getSession } from "@/lib/auth/getSession";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

const PUBLIC_EXCLUDE = "-pressKit -managedBy -ownerId -__v";

// Fields that only an admin may set — silently stripped from any other caller's body.
const ADMIN_ONLY_FIELDS = ["isPublished", "isFeatured", "managedBy", "ownerId"];

// GET /api/artists/[id] — public
export async function GET(request, { params }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'artists-detail',
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!allowed) return rateLimitResponse(retryAfter);

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
}

// PATCH /api/artists/[id] — owner, manager, or admin
export async function PATCH(request, { params }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'artists-update',
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) return rateLimitResponse(retryAfter);

  const { id } = await params;
  const { session, profile } = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const artist = await Artist.findById(id);
    if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = artist.ownerId === session.user.id;
    const isPrivileged = ["manager", "admin"].includes(profile?.role);

    if (!isOwner && !isPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    if (profile?.role !== "admin") {
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
}

// DELETE /api/artists/[id] — admin only
export async function DELETE(request, { params }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'artists-delete',
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) return rateLimitResponse(retryAfter);

  const { error } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;

  try {
    await dbConnect();
    await Artist.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE DELETE /api/artists/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
