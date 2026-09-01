import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const metadata = { title: "Profile - Midwave Productions" };

export default async function ProfilePage() {
  const { session, profile } = await getSession();
  if (!session) redirect("/");

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-12">
        <SectionNumber n="2" />
        <SectionHeading className="!text-3xl">Profile</SectionHeading>
      </div>
      <ProfileForm
        initialName={session.user.name || ""}
        initialPicture={session.user.picture || ""}
        email={session.user.email}
        roles={profile?.roles?.length ? profile.roles : ["user"]}
      />
    </div>
  );
}
