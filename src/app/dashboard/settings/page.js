import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "@/components/layout/SignOutButton";

export const metadata = { title: "Settings - Midwave Productions" };

export default async function SettingsPage() {
  const { session, profile } = await getSession();
  if (!session) redirect("/");

  await dbConnect();
  const user = await User.findById(session.user.id).select("createdAt").lean();

  const roles = profile?.roles?.length ? profile.roles : ["user"];
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown";

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-12">
        <SectionNumber n="3" />
        <SectionHeading className="!text-3xl">Settings</SectionHeading>
      </div>

      <div className="max-w-2xl bg-surface rounded border border-border p-6">
        <div className="mb-6">
          <h3 className="text-sm font-mono text-accent-2 tracking-widest uppercase mb-4">
            Account Information
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-mono text-muted tracking-widest uppercase mb-2">Email</p>
              <p className="text-text">{session.user.email}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-muted tracking-widest uppercase mb-2">Joined</p>
              <p className="text-text">{joinedDate}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-muted tracking-widest uppercase mb-2">Role</p>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge key={role} variant="yellow">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-mono text-accent-2 tracking-widest uppercase mb-4">
            Session
          </h3>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
