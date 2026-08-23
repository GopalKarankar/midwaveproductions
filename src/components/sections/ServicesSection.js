"use client";
import { motion } from "framer-motion";
import { SectionStrip } from "@/components/ui/SectionStrip";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

const services = [
  {
    number: "1",
    heading: "ARTIST MANAGEMENT",
    description:
      "Day-to-day career direction, contracts, and strategy for the artists we represent.",
  },
  {
    number: "2",
    heading: "PROMOTION & PR",
    description:
      "Release campaigns, press outreach, and audience growth across every channel.",
  },
  {
    number: "3",
    heading: "EVENT BOOKING & LOGISTICS",
    description:
      "End-to-end booking, routing, and on-the-ground event logistics.",
  },
];

// N°4 — Services
export function ServicesSection() {
  const { fadeInUp } = useReducedMotionVariants();

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {services.map((service) => (
        <motion.div key={service.number} variants={fadeInUp}>
          <SectionStrip
            number={service.number}
            heading={service.heading}
            description={service.description}
            href="/services"
          />
        </motion.div>
      ))}
    </motion.section>
  );
}
