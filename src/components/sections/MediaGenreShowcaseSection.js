"use client";

import { useMemo } from "react";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { GenreShowcaseGroup } from "@/components/media/GenreShowcaseGroup";
import { VideoThumbCard } from "@/components/media/VideoThumbCard";
import { videoShowcase } from "@/lib/data/placeholderMedia";

export function MediaGenreShowcaseSection() {
  const groupedByGenre = useMemo(() => {
    const groups = {};
    videoShowcase.forEach((item) => {
      if (!groups[item.genre]) {
        groups[item.genre] = [];
      }
      groups[item.genre].push(item);
    });
    return groups;
  }, []);

  const genres = Object.keys(groupedByGenre);

  return (
    <section className="px-6 md:px-12 py-24">
      <div className="flex items-center gap-3 mb-10">
        <SectionNumber n="1" />
      </div>

      <div className="flex flex-col gap-16">
        {genres.map((genre) => (
          <GenreShowcaseGroup key={genre} genre={genre}>
            {groupedByGenre[genre].map((video) => (
              <VideoThumbCard key={video.id} item={video} />
            ))}
          </GenreShowcaseGroup>
        ))}
      </div>

      <p className="text-center font-mono text-xs text-muted tracking-widest uppercase mt-8">
        ← DRAG →
      </p>
    </section>
  );
}
