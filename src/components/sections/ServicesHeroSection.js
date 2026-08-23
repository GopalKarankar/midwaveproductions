"use client";
import { motion } from "framer-motion";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

const headingWords = ["OUR", "SERVICES"];

// N°0 — Services page hero
export function ServicesHeroSection() {
  const { fadeInUp } = useReducedMotionVariants();

  return (
    <section className="relative flex h-svh flex-col justify-between overflow-hidden bg-bg px-6 md:px-12 py-8">
      <div className="relative flex justify-end">
        <VersionLabel version="002" year="2024" />
      </div>

      <motion.div
        className="relative flex flex-col gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <h1 className="font-display text-7xl md:text-8xl uppercase leading-none tracking-display text-highlight">
          {headingWords.map((word) => (
            <motion.span key={word} variants={fadeInUp} className="block">
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p
          variants={fadeInUp}
          className="font-body text-muted text-sm max-w-md"
        >
          Management. Promotion. Bookings. Media.
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
