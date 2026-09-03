import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import Feedback from "@/lib/mongodb/models/Feedback";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";
import { sendFeedbackNotificationEmail } from "@/lib/email/resend";

const FEEDBACK_CATEGORIES = ["general", "feature_request", "praise", "other"];

export const GET = withApiLog("feedback-list", async function GET(request, { logMeta }) {
  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  try {
    await dbConnect();
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ feedbacks });
  } catch (err) {
    console.error("[ROUTE GET /api/feedback]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const POST = withApiLog("feedback-create", async function POST(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "feedback", limit: 5, windowMs: 10 * 60 * 1000 });
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
    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (body.message.trim().length > 2000) {
      return NextResponse.json({ error: "Message must be 2000 characters or less" }, { status: 400 });
    }
    if (body.category && !FEEDBACK_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const feedback = await Feedback.create({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      category: body.category || "general",
      rating: body.rating ? Number(body.rating) : undefined,
      message: body.message.trim(),
      status: "new",
    });

    sendFeedbackNotificationEmail({
      name: feedback.name,
      email: feedback.email,
      category: feedback.category,
      rating: feedback.rating,
      message: feedback.message,
    }).catch((err) => {
      console.error("[EMAIL] Feedback notification failed", err);
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (err) {
    console.error("[ROUTE POST /api/feedback]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
