"use client";
import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SITEMAP_ENTRIES } from "@/lib/data/sitemapEntries";
import { PillCard } from "@/components/ui/PillCard";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalDragCarousel } from "@/components/ui/HorizontalDragCarousel";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { UserMenu } from "@/components/layout/UserMenu";
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

const navLinkClass = "flex items-center gap-[clamp(0.4rem,2vw,0.75rem)] py-[clamp(0.25rem,1.4dvh,0.75rem)] border-b border-border hover:text-accent transition-colors duration-200 min-w-0";

export function MobileMenu({ socialLinks = [] }) {
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
              className="w-full h-full flex flex-row relative"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Left panel — navigation */}
              <motion.nav
                variants={reducedSlideInLeft}
                className="flex-1 flex flex-col justify-between border-r border-border px-[clamp(1rem,5vw,1.5rem)] py-[clamp(0.75rem,4dvh,2rem)] overflow-y-auto scrollbar-none min-w-0 min-h-0"
              >
                <div>
                  <h2 className="font-display text-[clamp(0.9rem,3.5dvh,1.25rem)] uppercase text-accent mb-[clamp(0.5rem,2.5dvh,2rem)] tracking-display">
                    NAVIGATION
                  </h2>
                  <div className="mb-[clamp(0.5rem,2.5dvh,2rem)] min-[489px]:hidden">
                    <UserMenu className="w-full justify-center border-accent" />
                  </div>
                  <ul className="space-y-0">
                    {/* Home link */}
                    <li>
                      <a
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className={navLinkClass}
                      >
                        <span className="font-mono text-accent-2 text-[clamp(0.55rem,1.6dvh,0.75rem)] tracking-widest">
                          N°0
                        </span>
                        <span className="font-display uppercase text-highlight text-[clamp(0.8rem,2.4dvh,1rem)] tracking-display">
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
                          className={navLinkClass}
                        >
                          <span className="font-mono text-accent-2 text-[clamp(0.55rem,1.6dvh,0.75rem)] tracking-widest">
                            N°{entry.n}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-display uppercase text-highlight text-[clamp(0.8rem,2.4dvh,1rem)] tracking-display break-words">
                              {entry.title}
                            </span>
                            <span className="font-mono text-[clamp(0.55rem,1.6dvh,0.75rem)] text-muted break-words">
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
                  <h3 className="font-mono text-[clamp(0.55rem,1.6dvh,0.75rem)] text-accent-2 tracking-widest uppercase mb-[clamp(0.4rem,2dvh,1rem)]">
                    Socials & Contact
                  </h3>
                  <ul className="flex flex-wrap gap-x-[clamp(0.75rem,3vw,1.25rem)] gap-y-[clamp(0.2rem,1dvh,0.5rem)]">
                    {socialLinks.map(({ n, label, href }) => (
                      <li key={n}>
                        <a
                          href={href}
                          className="font-mono text-[clamp(0.6rem,1.6dvh,0.75rem)] tracking-widest uppercase text-accent hover:text-accent-hover transition-colors duration-200"
                        >
                          <span className="text-accent-2">{n}.</span> {label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>

                  {/* Footer info */}
                  <div className="mt-[clamp(0.5rem,2.5dvh,2rem)] pt-[clamp(0.4rem,2dvh,1.5rem)] border-t border-border">
                    <p className="font-mono text-[clamp(0.55rem,1.5dvh,0.75rem)] text-muted tracking-widest uppercase mb-2">
                      Copyright © Midwave Productions™
                      <br />
                      All Rights Reserved
                    </p>
                    <div className="mt-[clamp(0.25rem,1.2dvh,0.75rem)]">
                      <VersionLabel />
                    </div>
                  </div>
                </div>
              </motion.nav>

              {/* Right panel — pill cards showcase */}
              <motion.div
                variants={reducedSlideInRight}
                className="flex-1 flex flex-col justify-center-safe items-center border-r border-border px-[clamp(0.75rem,4vw,1.5rem)] py-[clamp(0.75rem,4dvh,2rem)] overflow-y-auto overflow-x-hidden scrollbar-none min-w-0 min-h-0"
              >
                <div className="flex flex-col gap-[clamp(0.15rem,0.6dvh,0.5rem)] mb-[clamp(0.5rem,2dvh,1rem)] text-center w-full sticky top-0 z-10 bg-bg py-2">
                  <SectionNumber n="6" />
                  <SectionHeading className="text-2xl min-[360px]:text-3xl min-[400px]:text-4xl">
                    EXPLORE
                  </SectionHeading>
                </div>

                <HorizontalDragCarousel showControls controlsClassName="sticky bottom-0 z-10 bg-bg pt-1">
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
