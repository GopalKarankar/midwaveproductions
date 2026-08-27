import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import SiteSettings from "@/lib/mongodb/models/SiteSettings";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LegalPageEditor } from "@/components/admin/LegalPageEditor";

export const metadata = {
  title: "About Us - Midwave Productions",
};

export default async function AboutUsPage() {
  const { session, profile } = await getSession();
  if (!session || !profile?.roles?.includes("admin")) redirect("/");

  await dbConnect();
  const settings = await SiteSettings.findOne({}).lean();
  const aboutContent = settings?.legalPages?.about || "";

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-12">
        <SectionNumber n="12" />
        <SectionHeading className="!text-3xl">About Us</SectionHeading>
      </div>

      <LegalPageEditor pageKey="about" initialContent={aboutContent} />
    </div>
  );
}
