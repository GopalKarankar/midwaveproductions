import Link from "next/link";
import { SectionNumber } from "@/components/ui/SectionNumber";

export function AdminSidebar() {
  const adminItems = [
    { n: 1, label: "Overview", href: "/admin" },
    { n: 2, label: "Artists", href: "/admin/artists" },
    { n: 3, label: "Bookings", href: "/admin/bookings" },
    { n: 4, label: "Users", href: "/admin/users" },
    { n: 5, label: "Media", href: "/admin/media" },
  ];

  return (
    <aside className="w-48 border-r border-border bg-surface p-6 flex flex-col gap-8 sticky top-0 h-svh overflow-y-auto">
      <Link href="/admin" className="block">
        <h1 className="font-display uppercase text-sm tracking-display text-highlight hover:text-accent transition-colors">
          ADMIN PANEL
        </h1>
      </Link>

      <nav className="flex flex-col gap-4">
        {adminItems.map(({ n, label, href }) => (
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
        <Link
          href="/api/auth/logout"
          className="text-xs font-mono tracking-widest uppercase text-error hover:text-accent-hover transition-colors"
        >
          Logout
        </Link>
      </div>
    </aside>
  );
}
