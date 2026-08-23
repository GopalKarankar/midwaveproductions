"use client";
import { motion } from "framer-motion";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { slideInLeft, slideInRight } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";
import { serviceDetails } from "@/lib/data/placeholderServiceDetails";

const REDUCED_VARIANT = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// N°1–N°4 — Service detail strips, alternating slide direction/layout per entry
export function ServiceDetailsSection() {
  const { shouldReduceMotion } = useReducedMotionVariants();

  return (
    <div>
      {serviceDetails.map((service) => {
        const variant = shouldReduceMotion
          ? REDUCED_VARIANT
          : service.flip
            ? slideInRight
            : slideInLeft;

        return (
          <motion.div
            key={service.number}
            variants={variant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className={`border-t border-border py-16 px-6 md:px-12 flex flex-col gap-10 md:flex-row md:items-start md:justify-between ${
              service.flip ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="flex flex-col gap-4 max-w-xl">
              <SectionNumber n={service.number} />
              <SectionHeading
                className={`md:!text-6xl ${service.flip ? "md:text-right" : ""}`}
              >
                {service.heading}
              </SectionHeading>
              <p
                className={`font-body text-muted text-sm max-w-xl ${service.flip ? "md:text-right" : ""}`}
              >
                {service.description}
              </p>
            </div>

            {/* TODO: replace static deliverables with CMS/DB fetch if needed */}
            <div
              className={`flex flex-col gap-3 ${
                service.flip ? "md:items-end md:text-right" : "md:items-start"
              }`}
            >
              {service.deliverables.map((item) => (
                <span
                  key={item}
                  className="font-mono text-xs text-accent-2 tracking-widest uppercase"
                >
                  → {item}
                </span>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
