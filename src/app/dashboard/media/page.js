import dbConnect from "@/lib/mongodb/connect";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaAdminBrowser } from "@/components/admin/MediaAdminBrowser";

export const metadata = {
  title: "Manage Media - Midwave Productions",
};

export default async function AdminMediaPage() {
  await dbConnect();
  const assets = await MediaAsset.find()
    .populate("artistId", "stageName slug")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="5" />
        <SectionHeading className="!text-3xl">Media Storage</SectionHeading>
      </div>

      <MediaAdminBrowser assets={assets} />
    </div>
  );
}
