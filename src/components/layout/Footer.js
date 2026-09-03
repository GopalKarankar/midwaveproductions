import Image from "next/image";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { getSocialLinks } from "@/lib/settings/getSocialLinks";

export async function Footer() {
  const socialLinks = await getSocialLinks();
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
          {socialLinks.map(({ n, key, label, href }) => (
            <li key={n}>
              <a
                href={href}
                className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-text hover:text-accent-hover transition-colors duration-200"
              >
                <SocialIcon platform={key} className="w-3.5 h-3.5 shrink-0" />
                <span className="text-accent-2">{n}.</span> {label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-t border-border pt-6">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs text-muted tracking-widest uppercase">
            Copyright © Midwave Productions™
            <br />
            All Rights Reserved
          </p>
          <ul className="flex flex-wrap gap-4">
            <li>
              <a
                href="/terms"
                className="font-mono text-xs text-text hover:text-accent transition-colors duration-200 tracking-widest uppercase"
              >
                Terms ↗
              </a>
            </li>
            <li>
              <a
                href="/privacy"
                className="font-mono text-xs text-text hover:text-accent transition-colors duration-200 tracking-widest uppercase"
              >
                Privacy ↗
              </a>
            </li>
            <li>
              <a
                href="/feedback"
                className="font-mono text-xs text-text hover:text-accent transition-colors duration-200 tracking-widest uppercase"
              >
                Feedback ↗
              </a>
            </li>
            <li>
              <a
                href="/report-a-problem"
                className="font-mono text-xs text-text hover:text-accent transition-colors duration-200 tracking-widest uppercase"
              >
                Report a Problem ↗
              </a>
            </li>
          </ul>
        </div>
        <VersionLabel />
      </div>
    </footer>
  );
}
