"use client";

import { useState } from "react";
import { MediaPlayerModal } from "@/components/media/MediaPlayerModal";

export function AudioThumbCard({ item }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const title = item.label || item.filename || "Untitled";
  const artist = item.artistId?.stageName || "Artist";
  const url = item.url;
  const type = item.type || "audio";
  const mimeType = item.mimeType || "audio/mpeg";
  const filename = item.filename || title;

  if (!url) return null;

  const asset = { type, url, filename, label: item.label, mimeType, _id: item._id };

  return (
    <>
      <div
        className="group relative shrink-0 w-64 cursor-pointer border border-border p-4 flex flex-col justify-center bg-surface hover:bg-surface-2 transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsPlaying(true)}
      >
        {/* Play icon */}
        <div className="mb-3 text-accent text-2xl">♫</div>

        <h3 className="font-display text-sm uppercase tracking-display text-highlight mb-1 line-clamp-2">
          {title}
        </h3>
        <p className="text-xs font-body text-muted mb-3">{artist}</p>

        <button
          className="text-accent text-xs font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity text-left"
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying(true);
          }}
        >
          PLAY ↗
        </button>
      </div>

      {isPlaying && <MediaPlayerModal asset={asset} onClose={() => setIsPlaying(false)} />}
    </>
  );
}
