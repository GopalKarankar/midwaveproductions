import dbConnect from "@/lib/mongodb/connect";
import Artist from "@/lib/mongodb/models/Artist";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArtistsAdminTable } from "@/components/admin/ArtistsAdminTable";

export const metadata = {
  title: "Manage Artists - Midwave Productions",
};

export default async function AdminArtistsPage() {
  await dbConnect();
  const artists = await Artist.find().lean();

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="2" />
        <SectionHeading className="!text-3xl">Artists</SectionHeading>
      </div>

      <ArtistsAdminTable artists={artists} />
    </div>
  );
}
