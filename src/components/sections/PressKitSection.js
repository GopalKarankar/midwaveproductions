"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FormField } from "@/components/ui/FormField";
import { slideInLeft, slideInRight } from "@/lib/motion/variants";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

const includedItems = [
  {
    title: "Artist biographies",
    description: "Short & long form, ready for print or web.",
  },
  {
    title: "High-resolution press photography",
    description: "Studio and live shots, cleared for editorial use.",
  },
  {
    title: "Official logos and brand assets",
    description: "Wordmarks and artist logos in web and print formats.",
  },
  {
    title: "Music video links and embed codes",
    description: "Direct links plus ready-to-paste embed markup.",
  },
  {
    title: "Streaming links and DSP profiles",
    description: "Spotify, SoundCloud, YouTube, and more.",
  },
  {
    title: "Previous press coverage and quotes",
    description: "Curated quotes cleared for reuse in new coverage.",
  },
];

// N°3 — Press kit
export function PressKitSection() {
  const { fadeInUp, shouldReduceMotion } = useReducedMotionVariants();
  const [status, setStatus] = useState("idle"); // idle | submitting | sent
  const [formData, setFormData] = useState({ name: "", email: "", artist: "" });

  const left = shouldReduceMotion ? fadeInUp : slideInLeft;
  const right = shouldReduceMotion ? fadeInUp : slideInRight;

  function handleChange(field) {
    return (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: "Press Kit Request",
          message: `Artist requested: ${formData.artist}`,
        }),
      });
    } catch {
      // TODO: wire to dedicated /api/press-kit endpoint with Resend email + Supabase logging when built
    }
    setStatus("sent");
  }

  return (
    <section id="press-kit" className="px-6 md:px-12 pt-24">
      <div className="flex flex-col gap-2 mb-12">
        <SectionNumber n="2" />
        <SectionHeading>PRESS KIT</SectionHeading>
        <p className="font-body text-muted text-sm">
          Everything you need to cover our artists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-border">
        <motion.div
          className="border-b md:border-b-0 md:border-r border-border p-8 md:p-12"
          variants={left}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <h3 className="font-display text-2xl text-highlight uppercase tracking-display mb-6">
            WHAT&apos;S INCLUDED
          </h3>
          {/* TODO: replace static deliverables with CMS/DB fetch if needed */}
          <ul className="flex flex-col">
            {includedItems.map((item) => (
              <li key={item.title} className="border-b border-border py-4">
                <span className="block font-mono text-xs text-accent-2 tracking-widest uppercase">
                  → {item.title}
                </span>
                <span className="block font-body text-muted text-sm mt-1">
                  {item.description}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="p-8 md:p-12 flex flex-col justify-between gap-8"
          variants={right}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {status === "sent" ? (
            <p className="font-display text-2xl text-accent-2 uppercase tracking-display">
              KIT REQUEST SENT
            </p>
          ) : (
            <>
              <h3 className="font-display text-2xl text-highlight uppercase tracking-display">
                REQUEST A PRESS KIT
              </h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <FormField
                  id="press-kit-name"
                  label="YOUR NAME"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange("name")}
                />
                <FormField
                  id="press-kit-email"
                  label="EMAIL ADDRESS"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange("email")}
                />
                <FormField
                  id="press-kit-artist"
                  label="WHICH ARTIST"
                  type="text"
                  required
                  value={formData.artist}
                  onChange={handleChange("artist")}
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full bg-accent text-bg font-display text-lg tracking-display uppercase text-center py-4 hover:bg-accent-hover transition-colors duration-200 disabled:opacity-60"
                >
                  REQUEST KIT ↗
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
