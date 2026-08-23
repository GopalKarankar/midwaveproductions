"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { HorizontalDragCarousel } from "@/components/ui/HorizontalDragCarousel";
import { ArtistCard } from "@/components/ui/ArtistCard";
import { placeholderArtists, artistGenres } from "@/lib/data/placeholderArtists";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

// N°1 — Artist Roster showcase. Genre filter bar narrows which genre
// groups render; "ALL" (default) stacks every genre's own carousel with
// its flush-left label, per CLAUDE.md's genre-sectioned showcase spec.
export function ArtistRosterSection() {
  const [activeGenre, setActiveGenre] = useState("ALL");
  const { fadeInUp } = useReducedMotionVariants();

  const artistsByGenre = useMemo(() => {
    const genresToShow = activeGenre === "ALL" ? artistGenres : [activeGenre];
    return genresToShow.map((genre) => ({
      genre,
      artists: placeholderArtists.filter((a) => a.genre === genre),
    }));
  }, [activeGenre]);

  return (
    <section className="px-6 md:px-12 py-16">
      <div className="flex flex-wrap gap-3 mb-16">
        <GenreFilterTag
          label="ALL"
          active={activeGenre === "ALL"}
          onClick={() => setActiveGenre("ALL")}
        />
        {artistGenres.map((genre) => (
          <GenreFilterTag
            key={genre}
            label={genre}
            active={activeGenre === genre}
            onClick={() => setActiveGenre(genre)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-16">
        {artistsByGenre.map(({ genre, artists }) => (
          <motion.div
            key={genre}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeInUp}>
              <SectionHeading className="!text-accent-2 !text-3xl md:!text-4xl mb-6">
                {genre}
              </SectionHeading>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <HorizontalDragCarousel>
                {artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </HorizontalDragCarousel>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <p className="text-center font-mono text-xs text-muted tracking-widest uppercase mt-2 mb-10">
        ← DRAG →
      </p>

      <div className="flex justify-center">
        <ArrowLink href="/artists">WATCH MORE</ArrowLink>
      </div>
    </section>
  );
}

function GenreFilterTag({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-xs px-3 py-1 rounded-full uppercase tracking-widest transition-colors duration-200 border ${
        active
          ? "bg-accent text-bg border-accent"
          : "bg-transparent text-accent-2 border-border hover:border-accent-2"
      }`}
    >
      {label}
    </button>
  );
}
