"use client";
import { useReducedMotion as useFramerReducedMotion } from "framer-motion";
import { fadeInUp as fadeInUpBase } from "@/lib/motion/variants";

// Wraps framer-motion's reduced-motion detection and returns variants that
// respect it — per CLAUDE.md's animation rules: "If true, skip transforms
// — fade only at 50% duration."
export function useReducedMotionVariants() {
  const shouldReduceMotion = useFramerReducedMotion();

  const fadeInUp = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
      }
    : fadeInUpBase;

  return { shouldReduceMotion, fadeInUp };
}
