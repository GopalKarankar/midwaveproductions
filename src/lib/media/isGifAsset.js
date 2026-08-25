// Single source of truth for GIF detection per spec's GIF handling rule
export function isGifAsset(mimeType) {
  return mimeType === "image/gif";
}
