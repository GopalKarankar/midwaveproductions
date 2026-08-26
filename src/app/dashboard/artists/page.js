import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import Artist from "@/lib/mongodb/models/Artist";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArtistsAdminTable } from "@/components/admin/ArtistsAdminTable";
import { DashboardArtistPanel } from "@/components/dashboard/DashboardArtistPanel";

export const metadata = {
  title: "Manage Artists - Midwave Productions",
};

export default async function AdminArtistsPage() {
  const { session, profile } = await getSession();

  if (!session) {
    redirect("/");
  }

  await dbConnect();

  // Admin: show all artists in admin console
  if (profile?.role === "admin") {
    const artists = await Artist.find()
      .select("stageName genres profileImage isPublished isFeatured managedBy createdAt")
      .populate("managedBy", "email name")
      .sort({ createdAt: -1 })
      .lean();

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

  // Artist: show their own profile panel
  if (profile?.role === "artist") {
    const artist = await Artist.findOne({ ownerId: session.user.id }).lean();
    return <DashboardArtistPanel artist={artist} userId={session.user.id} />;
  }

  // All other roles: locked out
  redirect("/");
}
