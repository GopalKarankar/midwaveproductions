"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useReducedMotionVariants } from "@/hooks/useReducedMotion";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { isGifAsset } from "@/lib/media/isGifAsset";

export function MediaPlayerModal({ asset, onClose }) {
  const { shouldReduceMotion } = useReducedMotionVariants();
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!asset) return null;

  const { type, url, filename, label, mimeType, _id } = asset;
  const title = label || filename || "Untitled";

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: shouldReduceMotion ? 0.15 : 0.3 } },
    exit: { opacity: 0, transition: { duration: shouldReduceMotion ? 0.15 : 0.2 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-brand-black/95 z-50 flex flex-col items-center justify-center"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-highlight hover:text-accent transition-colors"
          title="Close (Esc)"
        >
          <span className="text-2xl">✕</span>
        </button>

        {/* Content container */}
        <div className="flex-1 flex items-center justify-center max-w-4xl w-full px-6" onClick={(e) => e.stopPropagation()}>
          {type === "image" ? (
            <img
              src={url}
              alt={title}
              className="max-w-full max-h-full object-contain"
            />
          ) : type === "video" ? (
            <video
              src={url}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-full object-contain"
            />
          ) : type === "audio" ? (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <h2 className="font-display text-xl uppercase tracking-display text-highlight mb-2">
                  {title}
                </h2>
                <p className="font-body text-xs text-muted">Audio File</p>
              </div>
              <audio
                src={url}
                controls
                autoPlay
                className="w-full max-w-md"
              />
            </div>
          ) : null}
        </div>

        {/* Info footer */}
        <div className="text-center py-6">
          <p className="text-highlight font-mono text-sm">{title}</p>
          <p className="text-muted font-body text-xs mt-1">
            {type.charAt(0).toUpperCase() + type.slice(1)} · ESC to close
          </p>
          {_id && (
            <ArrowLink
              as="button"
              onClick={(e) => { e.stopPropagation(); copy(`${window.location.origin}/media/${_id}`); }}
              color="blue"
              className="mt-2"
            >
              {copied ? "Copied" : "Copy Link"}
            </ArrowLink>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
