"use client";

import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoGrid } from "@/components/media/PhotoGrid";
import { photoGallery } from "@/lib/data/placeholderMedia";

export function MediaPhotoSection() {
  return (
    <section className="px-6 md:px-12 py-24">
      <div className="flex items-center gap-3 mb-10">
        <SectionNumber n="3" />
        <SectionHeading className="!text-3xl">Photography</SectionHeading>
      </div>

      <PhotoGrid photos={photoGallery} />
    </section>
  );
}
