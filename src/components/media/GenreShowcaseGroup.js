"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalDragCarousel } from "@/components/ui/HorizontalDragCarousel";
import { staggerContainer, fadeInUp } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

export function GenreShowcaseGroup({ genre, children, isEmpty = false }) {
  const { fadeInUp: reducedFadeInUp } = useReducedMotionVariants();

  if (isEmpty || !children || (Array.isArray(children) && children.length === 0)) {
    return null;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <motion.div variants={reducedFadeInUp} className="mb-6">
        <SectionHeading className="!text-accent-2 !text-3xl md:!text-4xl">
          {genre}
        </SectionHeading>
      </motion.div>
      <motion.div variants={reducedFadeInUp}>
        <HorizontalDragCarousel>{children}</HorizontalDragCarousel>
      </motion.div>
    </motion.div>
  );
}
