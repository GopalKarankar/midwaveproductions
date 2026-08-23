"use client";
import { motion } from "framer-motion";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardFadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// TODO: replace with CMS or MongoDB press coverage collection
const pressCards = [
  {
    outlet: "SOUNDLINE MAGAZINE",
    quote: "The most confident live roster we've covered this year.",
    articleTitle: "Inside Midwave's Breakout Season",
    url: "#",
  },
  {
    outlet: "THE WEEKLY SET",
    quote: "Nova Reyes turns a diary entry into a room-wide singalong.",
    articleTitle: "Five Acts Worth Your Attention Right Now",
    url: "#",
  },
  {
    outlet: "CIRCUIT PRESS",
    quote: "Dust & Static prove analog still hits harder live.",
    articleTitle: "The Return of the Hardware Set",
    url: "#",
  },
];

// N°4 — Featured press coverage
export function PressCoverageSection() {
  const { shouldReduceMotion } = useReducedMotionVariants();
  const cardVariant = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }
    : cardFadeInUp;

  return (
    <section className="px-6 md:px-12 py-24">
      <div className="flex flex-col gap-2 mb-12">
        <SectionNumber n="3" />
        <SectionHeading className="!text-5xl">IN THE PRESS</SectionHeading>
        <p className="font-mono text-xs text-muted tracking-widest uppercase">
          FEATURES & COVERAGE
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-border"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {pressCards.map((card) => (
          <motion.div
            key={card.outlet}
            variants={cardVariant}
            className="border-b md:border-b-0 md:border-r border-border last:border-r-0 p-8 flex flex-col gap-4"
          >
            <span className="font-mono text-xs text-accent-2 tracking-widest uppercase">
              {card.outlet}
            </span>
            <p className="font-display text-xl text-highlight leading-tight">
              &ldquo;{card.quote}&rdquo;
            </p>
            <p className="font-body text-muted text-sm mt-2">{card.articleTitle}</p>
            <ArrowLink href={card.url} className="mt-auto">
              READ FEATURE
            </ArrowLink>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
