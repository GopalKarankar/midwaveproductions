import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import Artist from "@/lib/mongodb/models/Artist";
import User from "@/lib/mongodb/models/User";
import { ROLES } from "@/constants/roles";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArtistsAdminTable } from "@/components/admin/ArtistsAdminTable";
import { DashboardArtistPanel } from "@/components/dashboard/DashboardArtistPanel";
import { parseUserAgent } from "@/lib/utils/parseUserAgent";

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
    const artistUsers = await User.find({ role: ROLES.ARTIST })
      .select("email name picture role isBlocked blockedAt blockedBy blockReason createdAt devices")
      .populate("blockedBy", "email name")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = artistUsers.map((u) => u._id.toString());
    const artistDocs = await Artist.find({ ownerId: { $in: userIds } })
      .select("_id ownerId")
      .lean();
    const artistIdByOwnerId = new Map(artistDocs.map((a) => [a.ownerId, a._id.toString()]));

    const usersWithDevices = artistUsers.map((user) => ({
      ...user,
      artistId: artistIdByOwnerId.get(user._id.toString()) ?? null,
      devices: (user.devices || [])
        .slice()
        .sort((a, b) => new Date(b.lastSeenAt) - new Date(a.lastSeenAt))
        .map((d) => ({
          label: parseUserAgent(d.userAgent),
          lastSeenAt: d.lastSeenAt,
          loginCount: d.loginCount,
        })),
    }));

    return (
      <div className="px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <SectionNumber n="2" />
          <SectionHeading className="!text-3xl">Artists</SectionHeading>
        </div>
        <ArtistsAdminTable users={usersWithDevices} currentUserId={session?.user?.id} />
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
