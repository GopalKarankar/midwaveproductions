"use client";

import { useState } from "react";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { exportArtistPortfolioPdf } from "@/lib/pdf/exportArtistPortfolioPdf";

export function ExportPortfolioPdfButton({
  stageName,
  genre,
  bio,
  socialLinks,
  featuredTracks,
  upcomingEvents,
  slug,
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportArtistPortfolioPdf({
        stageName,
        genre,
        bio,
        socialLinks,
        featuredTracks,
        upcomingEvents,
        slug,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="font-mono text-xs text-accent hover:text-accent-hover disabled:text-muted transition-colors duration-200 disabled:cursor-not-allowed"
    >
      {isExporting ? "Exporting..." : "Export Portfolio ↓"}
    </button>
  );
}
