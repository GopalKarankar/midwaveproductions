import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/connect";
import Booking from "@/lib/mongodb/models/Booking";
import Artist from "@/lib/mongodb/models/Artist";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { sendBookingConfirmationEmail } from "@/lib/email/resend";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EVENT_TYPES = [
  "concert",
  "festival",
  "private_event",
  "corporate",
  "collaboration",
  "other",
];

// GET /api/bookings — admin only
export const GET = withApiLog("bookings-list", async function GET(_request, { logMeta }) {
  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  try {
    await dbConnect();
    const bookings = await Booking.find()
      .populate("artistId", "stageName slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("[ROUTE GET /api/bookings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// POST /api/bookings — public
export const POST = withApiLog("bookings", async function POST(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "bookings" });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  try {
    const body = await request.json();
    const {
      artistSlug,
      artistId,
      requesterName,
      requesterEmail,
      requesterPhone,
      organization,
      eventType,
      eventDate,
      eventLocation,
      budget,
      message,
    } = body;

    if (!artistSlug && !artistId) {
      return NextResponse.json({ error: "artistSlug is required" }, { status: 400 });
    }
    if (!requesterName?.trim()) {
      return NextResponse.json({ error: "requesterName is required" }, { status: 400 });
    }
    if (!requesterEmail || !EMAIL_REGEX.test(requesterEmail)) {
      return NextResponse.json(
        { error: "A valid requesterEmail is required" },
        { status: 400 }
      );
    }
    if (!EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: "A valid eventType is required" }, { status: 400 });
    }

    await dbConnect();

    // Never trust a client-asserted artist identity — always resolve through the DB.
    const artist = await (artistId && mongoose.isValidObjectId(artistId)
      ? Artist.findById(artistId)
      : Artist.findOne({ slug: artistSlug })
    ).select("stageName slug isPublished");

    if (!artist || !artist.isPublished) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const booking = await Booking.create({
      artistId: artist._id,
      requesterName: requesterName.trim(),
      requesterEmail: requesterEmail.trim().toLowerCase(),
      requesterPhone: requesterPhone?.trim(),
      organization: organization?.trim(),
      eventType,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      eventLocation: eventLocation?.trim(),
      budget: budget?.trim(),
      message: message?.trim(),
      // status is always server-assigned — never accepted from the client body
    });

    sendBookingConfirmationEmail({
      requesterName: booking.requesterName,
      requesterEmail: booking.requesterEmail,
      artistStageName: artist.stageName,
      eventType: booking.eventType,
    }).catch((err) => console.error("[ROUTE POST /api/bookings] confirmation email failed", err));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[ROUTE POST /api/bookings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
