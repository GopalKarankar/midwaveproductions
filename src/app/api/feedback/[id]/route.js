import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import Feedback from "@/lib/mongodb/models/Feedback";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const VALID_STATUSES = ["new", "reviewed", "archived"];

export const PATCH = withApiLog("feedback-update", async function PATCH(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "feedback-update", limit: 20, windowMs: 5 * 60 * 1000 });
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
    const feedback = await Feedback.findById(id);
    if (!feedback) return NextResponse.json({ error: "Feedback not found" }, { status: 404 });

    const body = await request.json();
    const update = {};

    if ("status" in body) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      update.status = body.status;
    }

    if ("adminNotes" in body) {
      update.adminNotes = body.adminNotes?.trim() || undefined;
    }

    const updated = await Feedback.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ feedback: updated });
  } catch (err) {
    console.error("[ROUTE PATCH /api/feedback/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
