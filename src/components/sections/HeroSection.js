"use client";
import { motion } from "framer-motion";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { staggerContainer, fadeInUp } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";
import { SITEMAP_ENTRIES, DASHBOARD_ENTRY } from "@/lib/data/sitemapEntries";
import { VersionLabel } from "@/components/ui/VersionLabel";

// N°1 — Hero + N°2 Sitemap as split-screen (50/50 desktop, stacked mobile)
export function HeroSection({ isAuthenticated = false }) {
  const { shouldReduceMotion, fadeInUp: reducedFadeInUp } = useReducedMotionVariants();
  const entries = isAuthenticated ? [...SITEMAP_ENTRIES, DASHBOARD_ENTRY] : SITEMAP_ENTRIES;

  return (
    <section className="relative w-full min-h-svh bg-bg grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-12 py-8">
      {/* Left column — Hero content */}
      <motion.div
        className="flex flex-col justify-between"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Breadcrumb — top */}
        <motion.p
          variants={reducedFadeInUp}
          className="font-mono text-xs tracking-widest text-muted uppercase"
        >
          MIDWAVE <span className="text-accent">— Home</span>
        </motion.p>

        {/* Animated wave-logo + showreel link — center */}
        <motion.div
          variants={reducedFadeInUp}
          className="relative flex items-center justify-center h-40"
        >
          {/* Decorative concentric circles */}
          <div className="absolute w-64 h-32 border border-border rounded-full" />
          <div className="absolute w-56 h-36 border border-border rounded-full -rotate-6" />

          {/* Animated wave path — only if not reducing motion */}
          {!shouldReduceMotion && (
            <motion.svg
              width="28" height="18" viewBox="0 0 28 18"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            >
              <path
                d="M2 2 Q8 2 10 10 Q12 18 18 10 Q20 2 26 2"
                stroke="currentColor"
                className="text-accent"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </motion.svg>
          )}

          {/* "Watch Showreel ↗" link — overlaid right */}
          <a
            href="#showreel"
            className="absolute right-0 font-mono text-xs text-highlight text-right leading-tight
              hover:text-accent transition-colors duration-200"
          >
            Watch<br />Showreel<br /><span className="text-accent">↗</span>
          </a>
        </motion.div>

        {/* Tagline + version — bottom-left */}
        <motion.div variants={reducedFadeInUp}>
          <p className="font-body font-bold text-text text-sm max-w-xs mb-4">
            Artist run — management, promotion, bookings and media production.
          </p>
          <VersionLabel variant="lg" />
        </motion.div>

        {/* Wordmark + scroll button — very bottom */}
        <motion.div variants={reducedFadeInUp}>
          <div className="border-t border-border mb-4" />
          <div className="flex items-center justify-between">
            <div className="font-display text-4xl md:text-5xl text-highlight tracking-widest">
              MIDWAVE
            </div>
            <a
              href="#showcase"
              aria-label="Scroll to showcase"
              className="w-14 h-14 rounded-full border border-border flex items-center justify-center
                text-highlight hover:border-accent hover:text-accent transition-colors duration-200"
            >
              ↓
            </a>
          </div>
          <div className="border-t border-border mt-4" />
        </motion.div>
      </motion.div>

      {/* Right column — Sitemap grid (N°2) */}
      <div className="flex flex-col">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-2 mb-8"
        >
          <SectionNumber n="2" />
          <SectionHeading>SITE-MAP ↓</SectionHeading>
        </motion.div>

        <motion.div
          className="flex-1 flex flex-col justify-start gap-0"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {entries.map(({ n, title, sub, action, href }) => (
            <motion.a
              key={n}
              href={href}
              variants={reducedFadeInUp}
              className="group block"
            >
              <div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-border py-3
                  group-hover:border-accent transition-colors duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
                  <span className="font-mono text-accent-2 text-xs tracking-widest uppercase">
                    N°{n}
                  </span>
                  <span className="font-display text-xl md:text-2xl tracking-display text-highlight uppercase">
                    {title}
                  </span>
                  <span className="font-mono text-xs text-muted tracking-widest uppercase">
                    — {sub}
                  </span>
                </div>
                <ArrowLink
                  href={href}
                  color={action === "contact" ? "yellow" : "blue"}
                  className="shrink-0"
                  as="span"
                >
                  {action}
                </ArrowLink>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
