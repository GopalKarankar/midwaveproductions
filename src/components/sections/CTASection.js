"use client";
import { motion } from "framer-motion";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

// N°8 — CTA band. Only section using brand-blue as a background.
export function CTASection() {
  const { fadeInUp } = useReducedMotionVariants();

  return (
    <section className="bg-brand-blue px-6 md:px-12 py-24">
      <motion.div
        className="flex flex-col items-center text-center gap-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.h2
          variants={fadeInUp}
          className="font-display text-6xl tracking-display uppercase text-bg leading-none"
        >
          READY TO WORK WITH US?
        </motion.h2>
        <motion.p variants={fadeInUp} className="font-body text-bg/70">
          Drop a booking inquiry.
        </motion.p>
        <motion.div variants={fadeInUp}>
          <ArrowLink
            href="/booking"
            color="black"
            className="underline underline-offset-4"
          >
            SEND INQUIRY
          </ArrowLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
