import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { parsePageParams, escapeRegex } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UsersAdminTable } from "@/components/admin/UsersAdminTable";
import { parseUserAgent } from "@/lib/utils/parseUserAgent";

export const metadata = {
  title: "Manage Users - Midwave Productions",
};

export default async function AdminUsersPage({ searchParams }) {
  const { session, profile } = await getSession();

  if (!session || !profile?.roles?.includes("admin")) {
    redirect("/");
  }

  await dbConnect();

  const params = await searchParams;
  const { page, pageSize, skip, limit, sort } = parsePageParams(params, {
    defaultPageSize: 20,
    allowedSort: ["email", "name", "createdAt"],
    defaultSort: "createdAt",
  });

  const searchTerm = params.q || "";
  const regex = searchTerm ? new RegExp(escapeRegex(searchTerm), "i") : null;
  const status = params.status || 'all';
  const role = params.role || 'all';

  const filter = {
    ...(regex && { $or: [{ email: regex }, { name: regex }] }),
    ...(status === 'blocked' && { isBlocked: true }),
    ...(status === 'active' && { isBlocked: false }),
    ...(role !== 'all' && { roles: role }),
  };

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select("email name picture roles isBlocked blockedAt blockedBy blockReason createdAt devices")
      .populate("blockedBy", "email name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  const usersWithDevices = users.map((user) => ({
    ...user,
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
        <SectionNumber n="4" />
        <SectionHeading className="!text-3xl">Users</SectionHeading>
      </div>

      <UsersAdminTable
        users={usersWithDevices}
        currentUserId={session?.user?.id}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </div>
  );
}
