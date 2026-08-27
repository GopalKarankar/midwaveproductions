import { cache } from "react";
import dbConnect from "@/lib/mongodb/connect";
import SiteSettings from "@/lib/mongodb/models/SiteSettings";

export const getLegalPages = cache(async function getLegalPages() {
  await dbConnect();
  const settings = await SiteSettings.findOne({}).lean();
  return settings?.legalPages || { terms: "", privacy: "", about: "" };
});

export { paragraphsFromText } from "@/lib/utils/paragraphsFromText";
