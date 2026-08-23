import { ArrowLink } from "@/components/ui/ArrowLink";

// Direct-contact fallback beneath the contact form
export function ContactInfoSection() {
  return (
    <section className="px-6 md:px-12 py-12 border-t border-border">
      <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2">
        Prefer email?
      </p>
      <ArrowLink href="mailto:info@midwaveproductions.com" color="yellow">
        info@midwaveproductions.com
      </ArrowLink>
    </section>
  );
}
