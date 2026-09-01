export function htmlToPlainText(html) {
  if (!html) return "";

  const container = typeof document !== "undefined" ? document.createElement("div") : null;
  if (!container) {
    return html.replace(/<[^>]*>/g, "");
  }

  container.innerHTML = html;
  const text = container.textContent || container.innerText || "";
  return text.trim();
}
