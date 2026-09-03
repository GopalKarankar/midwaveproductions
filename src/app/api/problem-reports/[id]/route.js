import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import ProblemReport from "@/lib/mongodb/models/ProblemReport";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const VALID_STATUSES = ["open", "investigating", "resolved", "wont_fix"];

export const PATCH = withApiLog("problem-reports-update", async function PATCH(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "problem-reports-update", limit: 20, windowMs: 5 * 60 * 1000 });
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
    const report = await ProblemReport.findById(id);
    if (!report) return NextResponse.json({ error: "Problem report not found" }, { status: 404 });

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

    const updated = await ProblemReport.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ report: updated });
  } catch (err) {
    console.error("[ROUTE PATCH /api/problem-reports/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
