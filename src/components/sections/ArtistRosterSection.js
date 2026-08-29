"use client";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { HorizontalDragCarousel } from "@/components/ui/HorizontalDragCarousel";
import { ArtistCard } from "@/components/ui/ArtistCard";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

// N°1 — Artist Roster showcase. Genre filter bar narrows which genre
// groups render; "ALL" (default) stacks every genre's own carousel with
// its flush-left label, per CLAUDE.md's genre-sectioned showcase spec.
export function ArtistRosterSection() {
  const [activeGenre, setActiveGenre] = useState("ALL");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fadeInUp } = useReducedMotionVariants();

  useEffect(() => {
    async function fetchArtists() {
      try {
        const res = await fetch("/api/artists");
        if (!res.ok) throw new Error("Failed to fetch artists");
        const data = await res.json();
        setArtists(data.artists || []);
      } catch (err) {
        console.error("Error fetching artists:", err);
        setError("Failed to load artists");
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  // Extract unique genres from artists
  const allGenres = useMemo(() => {
    const genreSet = new Set();
    artists.forEach((artist) => {
      (artist.genres || []).forEach((g) => genreSet.add(g));
    });
    return Array.from(genreSet).sort();
  }, [artists]);

  const artistsByGenre = useMemo(() => {
    const genresToShow = activeGenre === "ALL" ? allGenres : [activeGenre];
    return genresToShow
      .map((genre) => ({
        genre,
        artists: artists.filter((a) => (a.genres || []).includes(genre)),
      }))
      .filter((g) => g.artists.length > 0);
  }, [activeGenre, artists, allGenres]);

  if (loading) {
    return (
      <section className="px-6 md:px-12 py-16 text-center">
        <p className="text-muted">Loading artists...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-6 md:px-12 py-16 text-center">
        <p className="text-error">{error}</p>
      </section>
    );
  }

  if (artists.length === 0) {
    return (
      <section className="px-6 md:px-12 py-16 text-center">
        <p className="text-muted">No artists yet. Check back soon!</p>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-16">
      <div className="flex flex-wrap gap-3 mb-16">
        <GenreFilterTag
          label="ALL"
          active={activeGenre === "ALL"}
          onClick={() => setActiveGenre("ALL")}
        />
        {allGenres.map((genre) => (
          <GenreFilterTag
            key={genre}
            label={genre}
            active={activeGenre === genre}
            onClick={() => setActiveGenre(genre)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-16">
        {artistsByGenre.map(({ genre, artists: genreArtists }) => (
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
                {genreArtists.map((artist) => (
                  <ArtistCard key={artist._id || artist.slug} artist={artist} />
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
