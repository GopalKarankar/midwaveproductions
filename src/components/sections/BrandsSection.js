"use client";
import { motion } from "framer-motion";
import { placeholderBrands } from "@/lib/data/placeholderBrands";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

// N°7 — Brands / Partners
// No real partner logo assets exist yet — text chips stand in, with a
// muted → full-text-color hover as the placeholder for "grayscale → color".
export function BrandsSection() {
  const { fadeInUp } = useReducedMotionVariants();

  return (
    <section className="px-6 md:px-12 py-24">
      <p className="font-mono text-xs text-muted tracking-widest uppercase mb-8">
        #2024 — BRANDS WE HAVE WORKED WITH
      </p>
      <motion.div
        className="flex flex-wrap items-center gap-x-12 gap-y-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {placeholderBrands.map((brand) => (
          <motion.span
            key={brand}
            variants={fadeInUp}
            className="font-body text-sm text-muted hover:text-text transition-colors duration-200"
          >
            {brand}
          </motion.span>
        ))}
      </motion.div>
    </section>
  );
}
