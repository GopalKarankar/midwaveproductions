import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import Artist from "@/lib/mongodb/models/Artist";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const PUBLIC_SELECT = "-uploadedBy -__v";

// GET /api/media — public, returns published media only
export const GET = withApiLog("media-list", async function GET(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: "media-list",
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // filter by type: image, video, audio, document
    const artistId = searchParams.get("artistId");
    const genre = searchParams.get("genre"); // filter by artist genre

    const query = {};

    // Only fetch media for published artists
    const publishedArtistIds = await Artist.find({ isPublished: true }).select("_id").lean();
    const publishedIds = publishedArtistIds.map((a) => a._id);
    query.artistId = { $in: publishedIds };

    if (type) query.type = type;
    if (artistId) query.artistId = artistId;
    if (genre) {
      // If filtering by genre, find artists with that genre, then get their media
      const artistsInGenre = await Artist.find({
        isPublished: true,
        genres: genre,
      }).select("_id");
      const genreArtistIds = artistsInGenre.map((a) => a._id);
      query.artistId = { $in: genreArtistIds };
    }

    const media = await MediaAsset.find(query)
      .select(PUBLIC_SELECT)
      .populate("artistId", "stageName slug genres profileImage")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ media });
  } catch (err) {
    console.error("[ROUTE GET /api/media]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
