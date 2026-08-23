"use client";
import { motion } from "framer-motion";
import { SectionStrip } from "@/components/ui/SectionStrip";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";
import { aboutPillars } from "@/lib/data/placeholderAbout";

// N°5 — About pillars
export function AboutPillarsSection() {
  const { fadeInUp } = useReducedMotionVariants();

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {aboutPillars.map((pillar) => (
        <motion.div key={pillar.number} variants={fadeInUp}>
          <SectionStrip
            number={pillar.number}
            heading={pillar.heading}
            description={pillar.description}
            href={pillar.href}
          />
        </motion.div>
      ))}
    </motion.section>
  );
}
