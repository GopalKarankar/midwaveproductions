import Image from "next/image";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { socialLinks } from "@/constants/socialLinks";

export function Footer() {
  return (
    <footer className="bg-bg border-t border-border px-6 md:px-12 py-16">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
        <div className="flex items-center gap-4">
          <Image
            src="/images/Midwave productions logo (without caption).png"
            alt="Midwave Productions"
            width={56}
            height={26}
          />
          <span className="font-display text-2xl tracking-display uppercase text-highlight">
            Midwave Productions
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          {socialLinks.map(({ n, label, href }) => (
            <li key={n}>
              <a
                href={href}
                className="font-mono text-xs tracking-widest uppercase text-text hover:text-accent-hover transition-colors duration-200"
              >
                <span className="text-accent-2">{n}.</span> {label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-t border-border pt-6">
        <p className="font-mono text-xs text-muted tracking-widest uppercase">
          Copyright © Midwave Productions™
          <br />
          All Rights Reserved
        </p>
        <VersionLabel />
      </div>
    </footer>
  );
}
