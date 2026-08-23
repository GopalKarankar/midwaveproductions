import { SectionNumber } from "./SectionNumber";
import { SectionHeading } from "./SectionHeading";
import { ArrowLink } from "./ArrowLink";

// Full-bleed horizontal section strip with top border — used in Services
export function SectionStrip({ number, heading, description, href }) {
  return (
    <div className="border-t border-border py-10 px-6 md:px-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div className="flex flex-col gap-2">
        <SectionNumber n={number} />
        <SectionHeading>{heading}</SectionHeading>
        <p className="font-body text-muted text-sm max-w-md">{description}</p>
      </div>
      <ArrowLink href={href}>EXPLORE</ArrowLink>
    </div>
  );
}
