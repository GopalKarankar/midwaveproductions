import { SignOutButton } from "@/components/layout/SignOutButton";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { dashboardSidebarConfig } from "@/lib/data/sidebarNav";
import { SectionNumber } from "@/components/ui/SectionNumber";

export function DashboardSidebar({ userRole }) {
  return (
    <aside className="hidden md:flex w-48 border-r border-border bg-surface p-6 flex-col gap-8 sticky top-0 h-svh overflow-y-auto">
      <SidebarNav
        heading={dashboardSidebarConfig.heading}
        items={dashboardSidebarConfig.items}
        footer={<SignOutButton />}
      />
    </aside>
  );
}
