"use client";

import { useMemo, useState, useEffect } from "react";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { GenreShowcaseGroup } from "@/components/media/GenreShowcaseGroup";
import { VideoThumbCard } from "@/components/media/VideoThumbCard";

export function MediaGenreShowcaseSection() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const res = await fetch("/api/media?type=video");
        if (!res.ok) throw new Error("Failed to fetch media");
        const data = await res.json();
        setMedia(data.media || []);
      } catch (err) {
        console.error("Error fetching media:", err);
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
      // Get genre from artist
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
        <p className="text-muted">Loading media...</p>
      </section>
    );
  }

  if (genres.length === 0) {
    return (
      <section className="px-6 md:px-12 py-24 text-center">
        <p className="text-muted">No videos yet. Check back soon!</p>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-24">
      <div className="flex items-center gap-3 mb-10">
        <SectionNumber n="1" />
      </div>

      <div className="flex flex-col gap-16">
        {genres.map((genre) => (
          <GenreShowcaseGroup key={genre} genre={genre} isEmpty={groupedByGenre[genre].length === 0}>
            {groupedByGenre[genre].map((video) => (
              <VideoThumbCard key={video._id || video.id} item={video} />
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
