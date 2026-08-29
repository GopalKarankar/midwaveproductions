import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import Booking from "@/lib/mongodb/models/Booking";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const BOOKING_STATUSES = ["pending", "reviewing", "approved", "rejected", "cancelled"];

export const PATCH = withApiLog("bookings-update", async function PATCH(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'bookings-update',
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
    const { status, adminNotes } = await request.json();

    if (status && !BOOKING_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, reviewing, approved, rejected, cancelled" },
        { status: 400 }
      );
    }
    await dbConnect();
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes?.trim();

    const updated = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error("[ROUTE PATCH /api/bookings/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
