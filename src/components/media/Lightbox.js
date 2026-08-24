"use client";

import { useEffect, useState } from "react";

export function Lightbox({ photos, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photos.length, onClose]);

  const photo = photos[currentIndex];
  const hasPrev = photos.length > 1;
  const hasNext = photos.length > 1;

  return (
    <div
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

      {/* Image container */}
      <div className="flex-1 flex items-center justify-center max-w-4xl w-full px-6">
        <img
          src={photo.image}
          alt={photo.title || "Photo"}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6 py-6">
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
            }}
            className="text-accent hover:text-accent-hover transition-colors"
            title="Previous (←)"
          >
            <span className="font-display text-2xl">←</span>
          </button>
        )}

        <div className="text-center">
          <p className="text-highlight font-mono text-sm">
            {currentIndex + 1} / {photos.length}
          </p>
          {photo.title && (
            <p className="text-muted font-body text-xs mt-1">{photo.title}</p>
          )}
        </div>

        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % photos.length);
            }}
            className="text-accent hover:text-accent-hover transition-colors"
            title="Next (→)"
          >
            <span className="font-display text-2xl">→</span>
          </button>
        )}
      </div>

      {/* Keyboard hints */}
      <p className="text-muted font-mono text-xs tracking-widest uppercase mb-4">
        ← PREV · NEXT → · ESC CLOSE
      </p>
    </div>
  );
}
