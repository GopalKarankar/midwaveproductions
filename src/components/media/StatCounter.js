"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

// Isolated client island so MediaStatsSection can stay a Server Component.
export function StatCounter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { shouldReduceMotion } = useReducedMotionVariants();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || shouldReduceMotion) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, shouldReduceMotion]);

  const shown = inView && shouldReduceMotion ? value : display;

  return (
    <span
      ref={ref}
      className="font-display text-6xl md:text-7xl text-accent tracking-display"
    >
      {shown}
      {suffix}
    </span>
  );
}
