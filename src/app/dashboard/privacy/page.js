import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import SiteSettings from "@/lib/mongodb/models/SiteSettings";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LegalPageEditor } from "@/components/admin/LegalPageEditor";

export const metadata = {
  title: "Privacy Policy - Midwave Productions",
};

export default async function PrivacyPage() {
  const { session, profile } = await getSession();
  if (!session || !profile?.roles?.includes("admin")) redirect("/");

  await dbConnect();
  const settings = await SiteSettings.findOne({}).lean();
  const privacyContent = settings?.legalPages?.privacy || "";

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-12">
        <SectionNumber n="11" />
        <SectionHeading className="!text-3xl">Privacy Policy</SectionHeading>
      </div>

      <LegalPageEditor pageKey="privacy" initialContent={privacyContent} />
    </div>
  );
}
