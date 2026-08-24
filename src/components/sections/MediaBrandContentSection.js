"use client";

import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalDragCarousel } from "@/components/ui/HorizontalDragCarousel";
import { BrandContentCard } from "@/components/media/BrandContentCard";
import { brandContent } from "@/lib/data/placeholderMedia";

export function MediaBrandContentSection() {
  return (
    <section className="bg-surface border-y border-border px-6 md:px-12 py-24">
      <div className="flex items-center gap-3 mb-10">
        <SectionNumber n="2" />
        <SectionHeading className="!text-3xl">Brand Content</SectionHeading>
      </div>

      <HorizontalDragCarousel>
        {brandContent.map((item) => (
          <BrandContentCard key={item.id} item={item} />
        ))}
      </HorizontalDragCarousel>

      <p className="text-center font-mono text-xs text-muted tracking-widest uppercase mt-8">
        ← DRAG TO REVEAL →
      </p>
    </section>
  );
}
