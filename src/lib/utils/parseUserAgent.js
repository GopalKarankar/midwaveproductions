import { UAParser } from "ua-parser-js";

// Parses a raw user-agent string into a friendly "Browser on OS" label.
// Must never throw — used server-side on admin pages where a bad/missing
// UA string should degrade gracefully, not break the page.
export function parseUserAgent(userAgent) {
  if (!userAgent) return "Unknown device";

  try {
    const { browser, os } = new UAParser(userAgent).getResult();
    const browserName = browser.name || "Unknown browser";
    const osName = os.name || "Unknown OS";
    return `${browserName} on ${osName}`;
  } catch (err) {
    console.error("[parseUserAgent] Failed to parse user agent", err);
    return "Unknown device";
  }
}
