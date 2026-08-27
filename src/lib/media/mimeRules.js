export const MIME_RULES = {
  "image/jpeg": { type: "image", maxSize: 2 * 1024 * 1024 },
  "image/png": { type: "image", maxSize: 2 * 1024 * 1024 },
  "image/webp": { type: "image", maxSize: 2 * 1024 * 1024 },
  "image/gif": { type: "image", maxSize: 2 * 1024 * 1024 },
  "audio/mpeg": { type: "audio", maxSize: 20 * 1024 * 1024 },
  "audio/wav": { type: "audio", maxSize: 20 * 1024 * 1024 },
  "audio/ogg": { type: "audio", maxSize: 20 * 1024 * 1024 },
  "audio/x-m4a": { type: "audio", maxSize: 20 * 1024 * 1024 },
  "audio/mp4": { type: "audio", maxSize: 20 * 1024 * 1024 },
  "video/mp4": { type: "video", maxSize: 50 * 1024 * 1024 },
  "video/webm": { type: "video", maxSize: 50 * 1024 * 1024 },
  "video/quicktime": { type: "video", maxSize: 50 * 1024 * 1024 },
  "application/pdf": { type: "document", maxSize: 10 * 1024 * 1024 },
};

export const ACCEPT_ATTR = Object.keys(MIME_RULES).join(",");
