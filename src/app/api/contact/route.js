import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendContactEmail } from "@/lib/email/resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX_LENGTH = 2000;

// POST /api/contact — public
export async function POST(request) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "contact" });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
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
    console.error("[ROUTE /api/contact]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
