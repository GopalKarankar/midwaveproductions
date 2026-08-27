import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import SiteSettings from "@/lib/mongodb/models/SiteSettings";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinksTable } from "@/components/admin/SocialLinksTable";

export const metadata = {
  title: "Social Links - Midwave Productions",
};

export default async function SocialLinksPage() {
  const { session, profile } = await getSession();
  if (!session || !profile?.roles?.includes("admin")) redirect("/");

  await dbConnect();
  const settings = await SiteSettings.findOne({}).lean();
  const socialLinks = settings?.socialLinks || {};

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-12">
        <SectionNumber n="9" />
        <SectionHeading className="!text-3xl">Social Links</SectionHeading>
      </div>

      <SocialLinksTable initialLinks={socialLinks} />
    </div>
  );
}
