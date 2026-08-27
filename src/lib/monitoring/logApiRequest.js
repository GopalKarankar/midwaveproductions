import dbConnect from "@/lib/mongodb/connect";
import ApiRequestLog from "@/lib/mongodb/models/ApiRequestLog";
import { getClientIp } from "@/lib/rateLimit";

export async function logApiRequest({
  request,
  routeKey,
  statusCode,
  userId = null,
  userRole = null,
  rateLimited = false,
  startedAt,
}) {
  try {
    await dbConnect();
    await ApiRequestLog.create({
      method: request.method,
      routeKey,
      path: new URL(request.url).pathname,
      statusCode,
      ip: getClientIp(request),
      userId,
      userRole,
      rateLimited,
      durationMs: startedAt ? Date.now() - startedAt : undefined,
    });
  } catch (err) {
    console.error("[logApiRequest] Failed to persist API request log", err);
  }
}
