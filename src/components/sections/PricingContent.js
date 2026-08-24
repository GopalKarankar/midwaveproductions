"use client";

import { motion } from "framer-motion";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { staggerContainer, fadeInUp } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

export function PricingContent({ tiers }) {
  const { fadeInUp: reducedFadeInUp } = useReducedMotionVariants();

  return (
    <main className="bg-bg">
      {/* Hero section */}
      <section className="px-6 md:px-12 py-24">
        <motion.div
          className="max-w-2xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={reducedFadeInUp} className="flex items-center gap-3 mb-8">
            <SectionNumber n="1" />
            <span className="font-mono text-xs text-accent-2 tracking-widest uppercase">
              Transparent Pricing
            </span>
          </motion.div>

          <motion.h1
            variants={reducedFadeInUp}
            className="font-display text-5xl md:text-6xl tracking-display uppercase text-highlight mb-6"
          >
            Work Structure & Costs
          </motion.h1>

          <motion.p
            variants={reducedFadeInUp}
            className="font-body text-lg text-muted mb-8 max-w-lg leading-relaxed"
          >
            No surprises. No hidden fees. Every tier is customizable. Let's talk about what works
            for your needs.
          </motion.p>

          <motion.div variants={reducedFadeInUp} className="flex gap-6">
            <ArrowLink href="/booking" color="blue">
              Start a Project
            </ArrowLink>
            <ArrowLink href="/contact" color="yellow">
              Request Custom Quote
            </ArrowLink>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing tiers */}
      <motion.section
        className="px-6 md:px-12 py-24"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <motion.div
              key={tier.n}
              variants={reducedFadeInUp}
              className="border border-border bg-surface p-8 flex flex-col gap-6 hover:border-accent transition-colors"
            >
              <div>
                <span className="text-xs font-mono text-accent-2 tracking-widest uppercase">
                  N°{tier.n}
                </span>
                <h2 className="font-display text-2xl uppercase tracking-display text-highlight mt-2">
                  {tier.name}
                </h2>
                <p className="text-sm font-mono text-muted mt-2">{tier.description}</p>
              </div>

              <div className="border-y border-border py-4">
                <p className="font-display text-3xl tracking-display text-accent-2">
                  {tier.price}
                </p>
              </div>

              <ul className="flex flex-col gap-3 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="text-xs font-body text-muted flex gap-2">
                    <span className="text-accent-2 shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <ArrowLink href="/booking" color="blue" className="text-xs">
                Inquire
              </ArrowLink>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ section */}
      <section className="bg-surface border-y border-border px-6 md:px-12 py-24">
        <motion.div
          className="max-w-2xl"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={reducedFadeInUp} className="mb-8">
            <SectionNumber n="2" />
            <SectionHeading className="!text-3xl mt-4">FAQ</SectionHeading>
          </motion.div>

          <motion.div variants={reducedFadeInUp} className="flex flex-col gap-8">
            <div>
              <h3 className="font-display uppercase tracking-display text-highlight mb-2">
                Do you negotiate pricing?
              </h3>
              <p className="font-body text-muted">
                Yes. All tiers are starting points. We customize per project scope, timeline, and
                deliverables.
              </p>
            </div>

            <div>
              <h3 className="font-display uppercase tracking-display text-highlight mb-2">
                What if I need something not listed?
              </h3>
              <p className="font-body text-muted">
                That's where the ENTERPRISE tier comes in. Contact us for a custom scope.
              </p>
            </div>

            <div>
              <h3 className="font-display uppercase tracking-display text-highlight mb-2">
                How does the booking process start?
              </h3>
              <p className="font-body text-muted">
                Fill out a booking inquiry. We review, discuss scope, and send a quote. No
                commitment until you sign.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA band */}
      <section className="bg-accent px-6 md:px-12 py-16 flex flex-col items-center text-center gap-4">
        <SectionHeading className="!text-highlight">Ready to get started?</SectionHeading>
        <p className="font-body text-brand-black text-sm">Let's talk about your project.</p>
        <ArrowLink href="/booking" color="yellow">
          BOOK A CONSULTATION
        </ArrowLink>
      </section>
    </main>
  );
}
