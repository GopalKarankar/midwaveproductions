"use client";
import { motion } from "framer-motion";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { HorizontalDragCarousel } from "@/components/ui/HorizontalDragCarousel";
import { ArtistCard } from "@/components/ui/ArtistCard";
import { placeholderArtists } from "@/lib/data/placeholderArtists";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

// N°3 — Featured Artists (horizontal drag carousel)
export function FeaturedArtistsSection() {
  const { fadeInUp } = useReducedMotionVariants();

  return (
    <section className="px-6 md:px-12 py-24">
      <motion.div
        className="flex flex-col gap-2 mb-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <SectionNumber n="3" />
          <Badge variant="yellow">FEATURED</Badge>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <SectionHeading>ROSTER</SectionHeading>
        </motion.div>
      </motion.div>

      <HorizontalDragCarousel>
        {placeholderArtists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </HorizontalDragCarousel>

      <p className="text-center font-mono text-xs text-muted tracking-widest uppercase mt-2 mb-8">
        ← DRAG →
      </p>

      <div className="flex justify-center">
        <ArrowLink href="/artists">VIEW FULL ROSTER</ArrowLink>
      </div>
    </section>
  );
}
