import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UsersAdminTable } from "@/components/admin/UsersAdminTable";
import { parseUserAgent } from "@/lib/utils/parseUserAgent";

export const metadata = {
  title: "Manage Users - Midwave Productions",
};

export default async function AdminUsersPage() {
  const { session, profile } = await getSession();

  if (!session || profile?.role !== "admin") {
    redirect("/");
  }

  await dbConnect();
  const users = await User.find()
    .select("email name picture role isBlocked blockedAt blockedBy blockReason createdAt devices")
    .populate("blockedBy", "email name")
    .sort({ createdAt: -1 })
    .lean();

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

      <UsersAdminTable users={usersWithDevices} currentUserId={session?.user?.id} />
    </div>
  );
}
