"use client";

import { useState } from "react";

export function BrandContentCard({ item }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative shrink-0 w-80 cursor-pointer overflow-hidden border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && item.videoUrl ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-64 object-cover"
        >
          <source src={item.videoUrl} type="video/mp4" />
        </video>
      ) : (
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-64 object-cover transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.7 : 1 }}
        />
      )}

      <div className="p-4 bg-surface">
        <h3 className="font-display text-sm uppercase tracking-display text-highlight mb-1">
          {item.title}
        </h3>
        <p className="text-xs font-body text-muted">{item.description}</p>
      </div>
    </div>
  );
}
