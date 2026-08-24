import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";

export function DashboardUserPanel() {
  return (
    <div className="px-8 py-12 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="1" />
        <SectionHeading className="!text-3xl">Welcome</SectionHeading>
      </div>

      <div className="flex flex-col gap-6">
        <p className="font-body text-muted leading-relaxed">
          You're signed in as a fan. To manage artists or handle bookings, your account needs to
          be upgraded. Contact Midwave Productions for artist or manager access.
        </p>

        <div className="border-t border-b border-border py-6">
          <h2 className="font-display text-lg uppercase tracking-display text-accent-2 mb-4">
            Quick Links
          </h2>
          <div className="flex flex-col gap-2">
            <ArrowLink href="/artists">View Our Roster</ArrowLink>
            <ArrowLink href="/media">Browse Media</ArrowLink>
            <ArrowLink href="/booking">Book an Event</ArrowLink>
            <ArrowLink href="/contact">Get in Touch</ArrowLink>
          </div>
        </div>
      </div>
    </div>
  );
}
