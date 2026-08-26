"use client";

import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";

export function SidebarMobileDrawer({ heading, items, footer }) {
  const [isOpen, setIsOpen] = useState(false);
  const { shouldReduceMotion } = useReducedMotionVariants();

  const panelVariant = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  };

  const backdropVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
  };

  const reducedPanelVariant = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : panelVariant;

  const reducedBackdropVariant = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.15 } } }
    : backdropVariant;

  // Close menu on escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e) {
      if (e.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Lock body scroll when drawer is open
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
        aria-label="Open sidebar menu"
        aria-expanded={isOpen}
        suppressHydrationWarning
        className="md:hidden flex items-center justify-center size-10 border border-border hover:border-accent transition-colors duration-200"
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

      {/* Overlay drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              suppressHydrationWarning
              className="fixed inset-0 z-40 bg-black/60"
              variants={reducedBackdropVariant}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              key="panel"
              suppressHydrationWarning
              className="fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] border-r border-border bg-surface overflow-y-auto"
              variants={reducedPanelVariant}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close sidebar menu"
                className="absolute top-4 right-4 flex items-center justify-center size-10 border border-border hover:border-accent transition-colors duration-200"
              >
                <span className="text-lg text-highlight">×</span>
              </button>

              <SidebarNav
                heading={heading}
                items={items}
                footer={footer}
                onNavigate={() => setIsOpen(false)}
                className="p-6 h-full"
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </Fragment>
  );
}
