"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

function Counter({ value, suffix }) {
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
      className="font-display text-7xl text-accent tracking-display"
    >
      {shown}
      {suffix}
    </span>
  );
}

// N°5 — Stats
export function StatsSection({ stats = [] }) {
  return (
    <section className="px-6 md:px-12 py-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center gap-2">
          <Counter value={stat.value} suffix={stat.suffix} />
          <span className="font-mono text-xs text-accent-2 tracking-widest uppercase">
            {stat.label}
          </span>
        </div>
      ))}
    </section>
  );
}
