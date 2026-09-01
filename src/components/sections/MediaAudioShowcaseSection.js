"use client";

import { useMemo, useState, useEffect } from "react";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { GenreShowcaseGroup } from "@/components/media/GenreShowcaseGroup";
import { AudioThumbCard } from "@/components/media/AudioThumbCard";

export function MediaAudioShowcaseSection() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const res = await fetch("/api/media?type=audio");
        if (!res.ok) throw new Error("Failed to fetch media");
        const data = await res.json();
        setMedia(data.media || []);
      } catch (err) {
        console.error("Error fetching audio media:", err);
        setMedia([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, []);

  const groupedByGenre = useMemo(() => {
    const groups = {};
    media.forEach((item) => {
      const genres = item.artistId?.genres || ["Uncategorized"];
      const primaryGenre = genres[0] || "Uncategorized";
      if (!groups[primaryGenre]) {
        groups[primaryGenre] = [];
      }
      groups[primaryGenre].push(item);
    });
    return groups;
  }, [media]);

  const genres = Object.keys(groupedByGenre);

  if (loading) {
    return (
      <section className="px-6 md:px-12 py-24 text-center">
        <p className="text-muted">Loading audio...</p>
      </section>
    );
  }

  if (genres.length === 0) {
    return (
      <section className="px-6 md:px-12 py-24 text-center">
        <p className="text-muted">No audio yet. Check back soon!</p>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-24">
      <div className="flex items-center gap-3 mb-10">
        <SectionNumber n="2" />
      </div>

      <div className="flex flex-col gap-16">
        {genres.map((genre) => (
          <GenreShowcaseGroup key={genre} genre={genre} isEmpty={groupedByGenre[genre].length === 0}>
            {groupedByGenre[genre].map((audio) => (
              <AudioThumbCard key={audio._id || audio.id} item={audio} />
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
