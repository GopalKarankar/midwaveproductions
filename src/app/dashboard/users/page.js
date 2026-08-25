import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UsersAdminTable } from "@/components/admin/UsersAdminTable";

export const metadata = {
  title: "Manage Users - Midwave Productions",
};

export default async function AdminUsersPage() {
  const { session } = await getSession();
  await dbConnect();
  const users = await User.find()
    .select("email name picture role isBlocked createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="4" />
        <SectionHeading className="!text-3xl">Users</SectionHeading>
      </div>

      <UsersAdminTable users={users} currentUserId={session?.user?.id} />
    </div>
  );
}
