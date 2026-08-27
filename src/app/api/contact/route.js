import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { sendContactEmail } from "@/lib/email/resend";
import { withApiLog } from "@/lib/monitoring/withApiLog";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX_LENGTH = 2000;

// POST /api/contact — public
export const POST = withApiLog("contact", async function POST(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "contact" });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    if (message.trim().length > MESSAGE_MAX_LENGTH) {
      return NextResponse.json(
        { error: `message must be ${MESSAGE_MAX_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    await sendContactEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim(),
      message: message.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE POST /api/contact]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
});
