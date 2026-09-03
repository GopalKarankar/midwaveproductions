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

export async function sendStudioReservationConfirmationEmail({
  requesterName,
  requesterEmail,
  preferredDate,
  purpose,
}) {
  const resend = getClient();
  const dateStr = new Date(preferredDate).toLocaleDateString();
  return resend.emails.send({
    from: FROM_ADDRESS,
    to: requesterEmail,
    replyTo: process.env.CONTACT_EMAIL_TO,
    subject: "Studio reservation confirmed",
    text: `Hi ${requesterName},\n\nWe've received your studio reservation request for ${dateStr} (${purpose}). We'll confirm availability within 24 hours.\n\n— Midwave Productions`,
  });
}

export async function sendFeedbackNotificationEmail({
  name,
  email,
  category,
  rating,
  message,
}) {
  const resend = getClient();
  const ratingStr = rating ? `\nRating: ${rating}/5` : "";
  return resend.emails.send({
    from: FROM_ADDRESS,
    to: process.env.CONTACT_EMAIL_TO,
    replyTo: email,
    subject: `New feedback from ${name} — ${category}`,
    text: `From: ${name} <${email}>\nCategory: ${category}${ratingStr}\n\n${message}`,
  });
}

export async function sendProblemReportNotificationEmail({
  name,
  email,
  category,
  severity,
  message,
  pageUrl,
}) {
  const resend = getClient();
  const urlStr = pageUrl ? `\nPage: ${pageUrl}` : "";
  return resend.emails.send({
    from: FROM_ADDRESS,
    to: process.env.CONTACT_EMAIL_TO,
    replyTo: email,
    subject: `New problem report from ${name} — ${severity} ${category}`,
    text: `From: ${name} <${email}>\nCategory: ${category}\nSeverity: ${severity}${urlStr}\n\n${message}`,
  });
}
