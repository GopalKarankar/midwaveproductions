import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";

// N°5 — Pricing / work structure band
export function PricingBandSection() {
  return (
    <section className="bg-surface border-t border-b border-border px-6 md:px-12 py-16 flex flex-col items-center text-center gap-4">
      <SectionNumber n="5" />
      <SectionHeading className="md:!text-5xl">
        WORK STRUCTURE & COSTS
      </SectionHeading>
      <p className="font-body text-muted">Transparent pricing. No surprises.</p>
      <div className="flex gap-6 mt-2">
        <ArrowLink href="/pricing" color="blue">
          VIEW PRICING
        </ArrowLink>
        <ArrowLink href="/booking" color="yellow">
          SEND INQUIRY
        </ArrowLink>
      </div>
    </section>
  );
}
