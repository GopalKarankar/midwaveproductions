import { cache } from "react";
import dbConnect from "@/lib/mongodb/connect";
import SiteSettings from "@/lib/mongodb/models/SiteSettings";
import { SOCIAL_PLATFORMS } from "@/constants/socialPlatforms";

export const getSocialLinks = cache(async function getSocialLinks() {
  await dbConnect();
  const settings = await SiteSettings.findOne({}).lean();
  const stored = settings?.socialLinks || {};

  let n = 0;
  const links = [];
  for (const { key, label } of SOCIAL_PLATFORMS) {
    const href = stored[key];
    if (!href) continue;
    n += 1;
    links.push({ n, label, href });
  }
  return links;
});
