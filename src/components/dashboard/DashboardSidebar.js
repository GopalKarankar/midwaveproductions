import Link from "next/link";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SignOutButton } from "@/components/layout/SignOutButton";

export function DashboardSidebar({ userRole }) {
  const sidebarItems = [
    { n: 1, label: "Dashboard", href: "/dashboard" },
    { n: 2, label: "Profile", href: "/dashboard" },
    { n: 3, label: "Settings", href: "/dashboard" },
  ];

  return (
    <aside className="w-48 border-r border-border bg-surface p-6 flex flex-col gap-8 sticky top-0 h-svh overflow-y-auto">
      <Link href="/dashboard" className="block">
        <h1 className="font-display uppercase text-sm tracking-display text-highlight hover:text-accent transition-colors">
          Dashboard
        </h1>
      </Link>

      <nav className="flex flex-col gap-4">
        {sidebarItems.map(({ n, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-colors hover:text-accent"
          >
            <span className="text-accent-2">N°{n}</span>
            <span className="text-muted">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <SignOutButton />
      </div>
    </aside>
  );
}
