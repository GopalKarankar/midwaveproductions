"use client";

import { useState } from "react";

export function VideoThumbCard({ item }) {
  const [isHovered, setIsHovered] = useState(false);

  // Support both placeholder format and MediaAsset format
  let imageUrl = item.image || item.url;
  if (item.source === "youtube" && item.youtubeVideoId) {
    imageUrl = `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`;
  }

  const title = item.title || item.label || item.filename || "Untitled";
  const url = item.url;

  if (!imageUrl || !url) return null;

  return (
    <div
      className="group relative shrink-0 w-64 h-40 cursor-pointer overflow-hidden border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: isHovered ? 0.7 : 1 }}
      />

      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-brand-black to-transparent">
        <h3 className="font-display text-sm uppercase tracking-display text-highlight mb-2 line-clamp-2">
          {title}
        </h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent text-xs font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity"
        >
          WATCH ↗
        </a>
      </div>
    </div>
  );
}
