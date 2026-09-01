const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://midwaveproductions.com";
const DEFAULT_OG_IMAGE = {
  url: "/images/Midwave productions logo (with caption).png",
  width: 500,
  height: 500,
};

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  publishedTime,
}) {
  const images = image ? [{ url: image }] : [DEFAULT_OG_IMAGE];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Midwave Productions",
      images,
      type,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((img) => img.url),
    },
  };
}

export { SITE_URL };
