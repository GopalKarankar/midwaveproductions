"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

const SESSION_KEY = "midwave-loading-seen";

// N°0 — full-viewport loading screen, shown once per browser session.
// CLAUDE.md spec calls for a logo *SVG* path-draw animation, but only PNG
// logo assets exist — this fades/scales the PNG in instead. The .logo-path
// / animate-path-draw CSS (globals.css) is left in place, unused, for when
// a real SVG mark is exported.
export function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  const { shouldReduceMotion } = useReducedMotionVariants();

  // Split into two effects so React Strict Mode's dev-only double-invoke
  // of the mount effect can't race the sessionStorage check against the
  // timer: re-running this effect a second time would see the key already
  // set (from the first run) and skip re-arming the timer that its own
  // cleanup had just cleared, leaving the screen stuck visible forever.
  // sessionStorage is only reachable after mount (unavailable during SSR)
  // and has no change-event to subscribe to, so a direct setState here is
  // the only way to decide first-visit-of-session — not the cascading
  // re-render pattern react-hooks/set-state-in-effect warns against.
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: shouldReduceMotion ? 0.15 : 0.4 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.92 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            }}
          >
            <Image
              src="/images/Midwave productions logo (without caption).png"
              alt="Midwave Productions"
              width={220}
              height={103}
              priority
            />
          </motion.div>
          <motion.p
            className="font-display text-2xl tracking-display uppercase text-highlight"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.5, delay: shouldReduceMotion ? 0.1 : 0.6 },
            }}
          >
            Midwave Productions
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
