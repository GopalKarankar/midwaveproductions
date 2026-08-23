"use client";
import { motion } from "framer-motion";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

const headingLines = ["MEDIA", "& PRESS"];

// N°0 — Media & Press page hero
export function MediaHeroSection() {
  const { fadeInUp } = useReducedMotionVariants();

  return (
    <section className="relative flex h-svh flex-col justify-between overflow-hidden bg-bg px-6 md:px-12 py-8">
      <div className="relative flex justify-end">
        <VersionLabel version="003" year="2024" />
      </div>

      <motion.div
        className="relative flex flex-col gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <h1 className="font-display text-7xl md:text-8xl uppercase leading-none tracking-display text-highlight">
          {headingLines.map((line) => (
            <motion.span key={line} variants={fadeInUp} className="block">
              {line}
            </motion.span>
          ))}
        </h1>
        <motion.p
          variants={fadeInUp}
          className="font-body text-muted text-sm max-w-md"
        >
          Showcase, archive, and press resources for our roster.
        </motion.p>
      </motion.div>

      <div className="relative flex justify-center pb-4">
        <span className="font-mono text-xs text-muted tracking-widest animate-bounce-down">
          SCROLL ↓
        </span>
      </div>
    </section>
  );
}
