"use client";

import { useState } from "react";
import { Lightbox } from "@/components/media/Lightbox";

export function PhotoGrid({ photos }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="group relative aspect-square overflow-hidden border border-border hover:border-accent transition-colors"
          >
            <img
              src={photo.image}
              alt={photo.title || "Photo"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-brand-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-accent font-mono text-xs tracking-widest uppercase">
                View ↗
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <Lightbox
          photos={photos}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
