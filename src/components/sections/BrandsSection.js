"use client";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

// N°7 — Brands / Partners
export function BrandsSection({ brands = [] }) {
  const { fadeInUp } = useReducedMotionVariants();

  return (
    <section className="px-6 md:px-12 py-24">
      <p className="font-mono text-xs text-muted tracking-widest uppercase mb-8">
        #2024 — BRANDS WE HAVE WORKED WITH
      </p>
      <motion.div
        className="flex flex-wrap items-center gap-x-12 gap-y-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {brands.map((brand) => (
          <motion.div
            key={brand._id || brand.name}
            variants={fadeInUp}
            className="group"
          >
            {brand.logoUrl ? (
              <a
                href={brand.websiteUrl || "#"}
                target={brand.websiteUrl ? "_blank" : undefined}
                rel={brand.websiteUrl ? "noopener noreferrer" : undefined}
                className="block h-12 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-full object-contain"
                />
              </a>
            ) : (
              <span className="font-body text-sm text-muted group-hover:text-text transition-colors duration-200">
                {brand.name}
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
