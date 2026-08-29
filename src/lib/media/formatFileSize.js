export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "—";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
