import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import Artist from "@/lib/mongodb/models/Artist";
import { requireRole } from "@/lib/auth/requireRole";

const PUBLIC_EXCLUDE = "-pressKit -managedBy -ownerId -__v";

// GET /api/artists — public
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");

    // isPublished is always forced server-side — never trust a client query override
    const query = { isPublished: true };
    if (featured === "true") query.isFeatured = true;

    const artists = await Artist.find(query)
      .select(PUBLIC_EXCLUDE)
      .sort({ isFeatured: -1, stageName: 1 })
      .lean();

    return NextResponse.json({ artists });
  } catch (err) {
    console.error("[ROUTE GET /api/artists]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/artists — manager or admin only
export async function POST(request) {
  const { error, session } = await requireRole("manager");
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();

    if (!body.stageName?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ error: "stageName and slug are required" }, { status: 400 });
    }

    const artist = await Artist.create({
      stageName: body.stageName.trim(),
      slug: body.slug.trim().toLowerCase(),
      realName: body.realName?.trim(),
      bio: body.bio?.trim(),
      shortBio: body.shortBio?.trim(),
      genres: Array.isArray(body.genres) ? body.genres.map((g) => String(g).trim()) : [],
      socialLinks: body.socialLinks,
      profileImage: body.profileImage,
      coverImage: body.coverImage,
      featuredTracks: body.featuredTracks,
      upcomingEvents: body.upcomingEvents,
      // Privileged fields are never taken from the request body on create
      ownerId: body.ownerId || session.user.id,
      isPublished: false,
      isFeatured: false,
    });

    return NextResponse.json({ artist }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    console.error("[ROUTE POST /api/artists]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
