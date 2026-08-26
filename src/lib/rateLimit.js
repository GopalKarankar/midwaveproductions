// Best-effort in-memory per-IP rate limiter. This Map lives in a single
// serverless instance's memory — it resets on cold start and is NOT shared
// across concurrent instances, so it is an abuse deterrent, not a real
// security boundary. Swap for @upstash/ratelimit (Vercel KV) when available;
// keep this function's signature so call sites don't need to change.
const hits = new Map();

export function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(request, { routeKey, limit = 5, windowMs = 10 * 60 * 1000 }) {
  const ip = getClientIp(request);
  const key = `${routeKey}:${ip}`;
  const now = Date.now();

  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}
