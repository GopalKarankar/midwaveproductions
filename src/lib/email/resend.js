import { Resend } from "resend";

let client;

function getClient() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not defined");
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

const FROM_ADDRESS = "no-reply@midwaveproductions.com";

export async function sendContactEmail({ name, email, subject, message }) {
  const resend = getClient();
  return resend.emails.send({
    from: FROM_ADDRESS,
    to: process.env.CONTACT_EMAIL_TO,
    replyTo: email,
    subject: subject || `New contact from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });
}

export async function sendBookingConfirmationEmail({
  requesterName,
  requesterEmail,
  artistStageName,
  eventType,
}) {
  const resend = getClient();
  return resend.emails.send({
    from: FROM_ADDRESS,
    to: requesterEmail,
    replyTo: process.env.CONTACT_EMAIL_TO,
    subject: `Booking inquiry received — ${artistStageName}`,
    text: `Hi ${requesterName},\n\nWe've received your ${eventType} booking inquiry for ${artistStageName}. We'll be in touch within 2 business days.\n\n— Midwave Productions`,
  });
}
