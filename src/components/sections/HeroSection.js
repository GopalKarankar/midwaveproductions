"use client";
import { motion } from "framer-motion";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { staggerContainer, fadeInUp } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";
import { SITEMAP_ENTRIES } from "@/lib/data/sitemapEntries";

// N°1 — Hero + N°2 Sitemap as split-screen (50/50 desktop, stacked mobile)
export function HeroSection() {
  const { shouldReduceMotion, fadeInUp: reducedFadeInUp } = useReducedMotionVariants();

  return (
    <section className="relative w-full min-h-svh bg-bg grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-12 py-8">
      {/* Left column — Hero content */}
      <motion.div
        className="flex flex-col justify-center gap-6 md:gap-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.p
          variants={reducedFadeInUp}
          className="font-mono text-xs tracking-widest uppercase text-accent"
        >
          ARTIST MANAGEMENT · PROMOTION · BOOKINGS
        </motion.p>

        {/* Headline — two lines with accent-2 highlight on "ARTISTS" */}
        <motion.h1
          variants={reducedFadeInUp}
          className="font-display text-4xl md:text-6xl lg:text-7xl leading-none tracking-display uppercase text-highlight"
        >
          WE MAKE{" "}
          <span className="text-accent-2">ARTISTS</span>
          <br />
          MOVE.
        </motion.h1>

        {/* Paragraph */}
        <motion.p
          variants={reducedFadeInUp}
          className="font-body text-muted text-sm md:text-base max-w-md"
        >
          An artist-run platform handling promotion, bookings, and media production — so the work can move people, not paperwork.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={reducedFadeInUp}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button variant="solid" href="/artists">
            VIEW OUR ROSTER
          </Button>
          <Button variant="outline" href="/booking">
            START A PROJECT
          </Button>
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
          {SITEMAP_ENTRIES.map(({ n, title, sub, action, href }) => (
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
