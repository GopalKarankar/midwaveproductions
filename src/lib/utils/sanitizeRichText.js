import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote", "h2", "h3"];
const ALLOWED_ATTRIBUTES = {
  a: ["href", "target", "rel"],
};

export function sanitizeRichText(html) {
  if (!html || typeof html !== "string") return "";

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    transformTags: {
      a: (tagName, attribs) => {
        return {
          tagName,
          attribs: {
            href: attribs.href || "",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      },
    },
  });
}
