import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export const metadata = {
  title: "Dashboard - Midwave Productions",
};

export default async function DashboardLayout({ children }) {
  const { session, profile, blocked } = await getSession();

  if (!session) {
    redirect(blocked ? "/?blocked=1" : "/");
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-svh bg-bg flex">
      {isAdmin ? <AdminSidebar /> : <DashboardSidebar userRole={profile?.role} />}
      <main className="flex-1 border-l border-border overflow-auto">
        {children}
      </main>
    </div>
  );
}
