"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function SidebarNav({ heading, headingHref = "/dashboard", items, footer, onNavigate, className }) {
  const pathname = usePathname();

  const isHeadingActive = pathname === headingHref;

  return (
    <div className={`flex flex-col gap-8 ${className || ""}`}>
      <Link href={headingHref} onClick={onNavigate} className="block">
        <h1 className={`font-display uppercase text-sm tracking-display transition-colors ${
          isHeadingActive ? "text-accent" : "text-highlight hover:text-accent"
        }`}>
          {heading}
        </h1>
      </Link>

      <nav className="flex flex-col gap-4">
        {items.map(({ n, label, href }, index) => {
          const isActive = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={`${href}-${index}`}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-colors pl-2 -ml-2 border-l-2 ${
                isActive
                  ? "border-accent"
                  : "border-transparent hover:text-accent"
              }`}
            >
              <span className="text-accent-2">N°{n}</span>
              <span className={isActive ? "text-accent" : "text-muted"}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {footer && <div className="mt-auto">{footer}</div>}
    </div>
  );
}
