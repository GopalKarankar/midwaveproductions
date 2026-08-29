"use client";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionNumber } from "@/components/ui/SectionNumber";

export function PillCard({ entry }) {
  const { n, title, sub, action, href } = entry;
  return (
    <div className="flex flex-col items-center justify-center w-32 min-[360px]:w-36 min-[400px]:w-40 shrink-0 h-44 min-[360px]:h-48 min-[400px]:h-56 px-4 min-[360px]:px-5 min-[400px]:px-6 py-6 min-[400px]:py-8 rounded-full border border-border bg-surface hover:border-accent transition-colors duration-200">
      <SectionNumber n={n} />
      <h3 className="font-display text-3xl min-[400px]:text-4xl text-accent-2 leading-none text-center mt-1 min-[400px]:mt-2 mb-1 min-[400px]:mb-2">
        {n}
      </h3>
      <p className="font-display text-xs min-[360px]:text-sm uppercase text-highlight text-center leading-tight mb-1 min-[400px]:mb-2">
        {title}
      </p>
      <p className="font-mono text-xs text-muted text-center mb-2 min-[400px]:mb-4">
        {sub}
      </p>
      <ArrowLink
        href={href}
        color={action === "contact" ? "yellow" : "blue"}
        className="text-xs"
      >
        {action}
      </ArrowLink>
    </div>
  );
}
