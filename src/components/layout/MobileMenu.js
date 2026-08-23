"use client";
import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SITEMAP_ENTRIES } from "@/lib/data/sitemapEntries";
import { socialLinks } from "@/constants/socialLinks";
import { PillCard } from "@/components/ui/PillCard";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalDragCarousel } from "@/components/ui/HorizontalDragCarousel";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const slideInLeftVariant = {
  hidden: { opacity: 0, x: "-100%" },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const slideInRightVariant = {
  hidden: { opacity: 0, x: "100%" },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const fadeScaleVariant = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { shouldReduceMotion } = useReducedMotionVariants();

  // Reduce-motion variants: opacity-only fades at 50% duration
  const reducedSlideInLeft = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : slideInLeftVariant;

  const reducedSlideInRight = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : slideInRightVariant;

  const reducedFadeScale = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.15 } } }
    : fadeScaleVariant;

  // Close menu on escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e) {
      if (e.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <Fragment>
      {/* Hamburger trigger — visible only on mobile */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        suppressHydrationWarning
        className="min-[489px]:hidden flex items-center justify-center size-10 border border-border hover:border-accent transition-colors duration-200"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-5"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            suppressHydrationWarning
            className="fixed inset-0 z-50 bg-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-full h-full flex flex-col md:flex-row relative"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Left panel — navigation */}
              <motion.nav
                variants={reducedSlideInLeft}
                className="flex-1 flex flex-col justify-between border-r border-border px-6 py-8 overflow-y-auto scrollbar-none min-w-0"
              >
                <div>
                  <h2 className="font-display text-xl uppercase text-accent mb-8 tracking-display">
                    NAVIGATION
                  </h2>
                  <div className="mb-8 min-[489px]:hidden">
                    <GoogleSignInButton
                      label="SIGN IN"
                      className="w-full justify-center border-accent"
                    />
                  </div>
                  <ul className="space-y-0">
                    {/* Home link */}
                    <li>
                      <a
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-3 border-b border-border hover:text-accent transition-colors duration-200"
                      >
                        <span className="font-mono text-accent-2 text-xs tracking-widest">
                          N°0
                        </span>
                        <span className="font-display uppercase text-highlight tracking-display">
                          Home
                        </span>
                      </a>
                    </li>
                    {/* Sitemap entries */}
                    {SITEMAP_ENTRIES.map((entry) => (
                      <li key={entry.n}>
                        <a
                          href={entry.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 py-3 border-b border-border hover:text-accent transition-colors duration-200"
                        >
                          <span className="font-mono text-accent-2 text-xs tracking-widest">
                            N°{entry.n}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-display uppercase text-highlight tracking-display">
                              {entry.title}
                            </span>
                            <span className="font-mono text-xs text-muted">
                              {entry.sub}
                            </span>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Socials & contact */}
                <div>
                  <h3 className="font-mono text-xs text-accent-2 tracking-widest uppercase mb-4">
                    Socials & Contact
                  </h3>
                  <ul className="space-y-2">
                    {socialLinks.map(({ n, label, href }) => (
                      <li key={n}>
                        <a
                          href={href}
                          className="font-mono text-xs tracking-widest uppercase text-accent hover:text-accent-hover transition-colors duration-200"
                        >
                          <span className="text-accent-2">{n}.</span> {label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>

                  {/* Footer info */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2">
                      Copyright © Midwave Productions™
                      <br />
                      All Rights Reserved
                    </p>
                    <div className="mt-3">
                      <VersionLabel />
                    </div>
                  </div>
                </div>
              </motion.nav>

              {/* Right panel — pill cards showcase */}
              <motion.div
                variants={reducedSlideInRight}
                className="flex-1 flex flex-col justify-start border-r border-border px-6 py-8 overflow-y-auto scrollbar-none min-w-0"
              >
                <div className="flex flex-col gap-2 mb-8">
                  <SectionNumber n="6" />
                  <SectionHeading className="text-4xl md:text-5xl">
                    EXPLORE
                  </SectionHeading>
                </div>

                <HorizontalDragCarousel showControls>
                  {SITEMAP_ENTRIES.map((entry) => (
                    <PillCard key={entry.n} entry={entry} />
                  ))}
                </HorizontalDragCarousel>
              </motion.div>

              {/* Center close button */}
              <motion.button
                variants={reducedFadeScale}
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] flex items-center justify-center size-16 rounded-full border-2 border-highlight hover:border-accent transition-colors duration-200"
              >
                <span className="text-3xl text-highlight">×</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
}
