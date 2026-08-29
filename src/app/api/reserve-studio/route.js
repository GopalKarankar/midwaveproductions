import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import StudioReservation from "@/lib/mongodb/models/StudioReservation";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";
import { sendStudioReservationConfirmationEmail } from "@/lib/email/resend";

const STUDIO_PURPOSES = ["recording", "mixing", "mastering", "rehearsal", "podcast", "other"];

export const GET = withApiLog("reserve-studio-list", async function GET(request, { logMeta }) {
  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  try {
    await dbConnect();
    const reservations = await StudioReservation.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ reservations });
  } catch (err) {
    console.error("[ROUTE GET /api/reserve-studio]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const POST = withApiLog("reserve-studio-create", async function POST(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "reserve-studio", limit: 5, windowMs: 60 * 1000 });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  try {
    await dbConnect();
    const body = await request.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.requesterName?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body.requesterEmail?.trim() || !emailRegex.test(body.requesterEmail.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!body.preferredDate) {
      return NextResponse.json({ error: "Preferred date is required" }, { status: 400 });
    }
    if (!body.startTime?.trim()) {
      return NextResponse.json({ error: "Start time is required" }, { status: 400 });
    }
    if (!body.durationHours || body.durationHours < 1 || body.durationHours > 12) {
      return NextResponse.json({ error: "Duration must be between 1 and 12 hours" }, { status: 400 });
    }
    if (!body.purpose || !STUDIO_PURPOSES.includes(body.purpose)) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    const reservation = await StudioReservation.create({
      requesterName: body.requesterName.trim(),
      requesterEmail: body.requesterEmail.trim().toLowerCase(),
      requesterPhone: body.requesterPhone?.trim(),
      preferredDate: new Date(body.preferredDate),
      startTime: body.startTime.trim(),
      durationHours: Number(body.durationHours),
      purpose: body.purpose,
      message: body.message?.trim(),
      status: "pending",
    });

    sendStudioReservationConfirmationEmail({
      requesterName: reservation.requesterName,
      requesterEmail: reservation.requesterEmail,
      preferredDate: reservation.preferredDate,
      purpose: reservation.purpose,
    }).catch((err) => {
      console.error("[EMAIL] Studio reservation confirmation failed", err);
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (err) {
    console.error("[ROUTE POST /api/reserve-studio]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
