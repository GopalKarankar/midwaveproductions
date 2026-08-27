import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import Artist from "@/lib/mongodb/models/Artist";
import User from "@/lib/mongodb/models/User";
import { ROLES } from "@/constants/roles";
import { parsePageParams, escapeRegex } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArtistsAdminTable } from "@/components/admin/ArtistsAdminTable";
import { DashboardArtistPanel } from "@/components/dashboard/DashboardArtistPanel";
import { parseUserAgent } from "@/lib/utils/parseUserAgent";

export const metadata = {
  title: "Manage Artists - Midwave Productions",
};

export default async function AdminArtistsPage({ searchParams }) {
  const { session, profile } = await getSession();

  if (!session) {
    redirect("/");
  }

  await dbConnect();

  // Admin: show all artists in admin console
  if (profile?.roles?.includes("admin")) {
    const params = await searchParams;
    const { page, pageSize, skip, limit, sort } = parsePageParams(params, {
      defaultPageSize: 20,
      allowedSort: ["email", "name", "createdAt"],
      defaultSort: "createdAt",
    });

    const searchTerm = params.q || "";
    const regex = searchTerm ? new RegExp(escapeRegex(searchTerm), "i") : null;
    const filter = {
      roles: ROLES.ARTIST,
      ...(regex && {
        $or: [{ email: regex }, { name: regex }],
      }),
    };

    const [artistUsers, totalCount] = await Promise.all([
      User.find(filter)
        .select("email name picture roles isBlocked blockedAt blockedBy blockReason createdAt devices")
        .populate("blockedBy", "email name")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

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
        <ArtistsAdminTable
          users={usersWithDevices}
          currentUserId={session?.user?.id}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
        />
      </div>
    );
  }

  // Artist (non-admin): show their own profile panel
  if (profile?.roles?.includes("artist")) {
    const artist = await Artist.findOne({ ownerId: session.user.id }).lean();
    return <DashboardArtistPanel artist={artist} userId={session.user.id} />;
  }

  // All other roles: locked out
  redirect("/");
}
