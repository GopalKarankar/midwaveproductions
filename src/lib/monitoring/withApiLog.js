import { logApiRequest } from "./logApiRequest";

export function withApiLog(routeKey, handler) {
  return async function wrapped(request, context) {
    const startedAt = Date.now();
    const logMeta = { userId: null, userRole: null, rateLimited: false };
    let response;
    try {
      response = await handler(request, { ...context, logMeta });
    } catch (err) {
      console.error(`[withApiLog ${routeKey}] Unhandled error`, err);
      response = new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
    logApiRequest({
      request,
      routeKey,
      statusCode: response.status,
      startedAt,
      ...logMeta,
    }).catch(() => {});
    return response;
  };
}
