"use client";
import { motion } from "framer-motion";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { HorizontalDragCarousel } from "@/components/ui/HorizontalDragCarousel";
import { MediaCard } from "@/components/ui/MediaCard";
import { placeholderMediaItems } from "@/lib/data/placeholderMedia";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

// N°1 — Media showcase (horizontal drag carousel)
export function MediaShowcaseSection() {
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
          <SectionNumber n="1" />
          <Badge variant="yellow">ARCHIVE</Badge>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <SectionHeading>SHOWCASE</SectionHeading>
        </motion.div>
      </motion.div>

      <HorizontalDragCarousel>
        {placeholderMediaItems.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </HorizontalDragCarousel>

      <p className="text-center font-mono text-xs text-muted tracking-widest uppercase mt-2">
        ← DRAG →
      </p>
    </section>
  );
}
