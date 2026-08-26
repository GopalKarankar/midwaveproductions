import Link from "next/link";

export function SidebarNav({ heading, headingHref = "/dashboard", items, footer, onNavigate, className }) {
  return (
    <div className={`flex flex-col gap-8 ${className || ""}`}>
      <Link href={headingHref} onClick={onNavigate} className="block">
        <h1 className="font-display uppercase text-sm tracking-display text-highlight hover:text-accent transition-colors">
          {heading}
        </h1>
      </Link>

      <nav className="flex flex-col gap-4">
        {items.map(({ n, label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-colors hover:text-accent"
          >
            <span className="text-accent-2">N°{n}</span>
            <span className="text-muted">{label}</span>
          </Link>
        ))}
      </nav>

      {footer && <div className="mt-auto">{footer}</div>}
    </div>
  );
}
