import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import ProblemReport from "@/lib/mongodb/models/ProblemReport";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";
import { sendProblemReportNotificationEmail } from "@/lib/email/resend";

const PROBLEM_CATEGORIES = ["bug", "ui_issue", "account", "booking", "payment", "other"];
const SEVERITIES = ["low", "medium", "high", "critical"];

export const GET = withApiLog("problem-reports-list", async function GET(request, { logMeta }) {
  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  try {
    await dbConnect();
    const reports = await ProblemReport.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ reports });
  } catch (err) {
    console.error("[ROUTE GET /api/problem-reports]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const POST = withApiLog("problem-reports-create", async function POST(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "problem-reports", limit: 5, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  try {
    await dbConnect();
    const body = await request.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body.email?.trim() || !emailRegex.test(body.email.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!body.category || !PROBLEM_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Valid category is required" }, { status: 400 });
    }
    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (body.message.trim().length > 2000) {
      return NextResponse.json({ error: "Message must be 2000 characters or less" }, { status: 400 });
    }
    if (body.severity && !SEVERITIES.includes(body.severity)) {
      return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
    }

    const report = await ProblemReport.create({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      category: body.category,
      severity: body.severity || "low",
      pageUrl: body.pageUrl?.trim(),
      message: body.message.trim(),
      status: "open",
    });

    sendProblemReportNotificationEmail({
      name: report.name,
      email: report.email,
      category: report.category,
      severity: report.severity,
      message: report.message,
      pageUrl: report.pageUrl,
    }).catch((err) => {
      console.error("[EMAIL] Problem report notification failed", err);
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    console.error("[ROUTE POST /api/problem-reports]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
