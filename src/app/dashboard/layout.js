import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SidebarMobileDrawer } from "@/components/layout/SidebarMobileDrawer";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { dashboardSidebarConfig, adminSidebarConfig } from "@/lib/data/sidebarNav";

export const metadata = {
  title: "Dashboard - Midwave Productions",
};

export default async function DashboardLayout({ children }) {
  const { session, profile, blocked } = await getSession();

  if (!session) {
    redirect(blocked ? "/?blocked=1" : "/");
  }

  const isAdmin = profile?.roles?.includes("admin");
  const sidebarConfig = isAdmin ? adminSidebarConfig : dashboardSidebarConfig;

  return (
    <div className="min-h-svh bg-bg flex flex-col md:flex-row">
      {/* Mobile-only topbar: hamburger + section heading */}
      <div className="md:hidden flex items-center gap-4 border-b border-border bg-bg px-6 py-4">
        <SidebarMobileDrawer
          heading={sidebarConfig.heading}
          items={sidebarConfig.items}
          footer={<SignOutButton />}
        />
        <span className="font-display uppercase text-sm tracking-display text-highlight">
          {sidebarConfig.heading}
        </span>
      </div>

      {isAdmin ? <AdminSidebar /> : <DashboardSidebar userRole={profile?.roles} />}
      <main className="flex-1 md:border-l border-border overflow-auto">
        {children}
      </main>
    </div>
  );
}
