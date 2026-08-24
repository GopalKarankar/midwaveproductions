import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export const metadata = {
  title: "Dashboard - Midwave Productions",
};

export default async function DashboardLayout({ children }) {
  const { session, profile } = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-svh bg-bg flex">
      <DashboardSidebar userRole={profile?.role} />
      <main className="flex-1 border-l border-border overflow-auto">
        {children}
      </main>
    </div>
  );
}
