import { MediaHeroSection } from "@/components/sections/MediaHeroSection";
import { MediaGenreShowcaseSection } from "@/components/sections/MediaGenreShowcaseSection";
import { MediaBrandContentSection } from "@/components/sections/MediaBrandContentSection";
import { MediaPhotoSection } from "@/components/sections/MediaPhotoSection";
import { MarqueeTicker } from "@/components/layout/MarqueeTicker";
import { PressKitSection } from "@/components/sections/PressKitSection";
import { PressCoverageSection } from "@/components/sections/PressCoverageSection";
import { MediaStatsSection } from "@/components/sections/MediaStatsSection";
import { MediaCTASection } from "@/components/sections/MediaCTASection";
import { Footer } from "@/components/layout/Footer";
import { placeholderArtists } from "@/lib/data/placeholderArtists";
import { mediaTags } from "@/lib/data/placeholderMedia";

export const metadata = {
  title: "Media & Press — Midwave Productions",
  description:
    "Media showcase, press kit, and press coverage for Midwave Productions' roster.",
};

const marqueeArtistNames = placeholderArtists.length
  ? placeholderArtists.map((artist) => artist.stageName)
  : ["ARTIST ONE", "ARTIST TWO", "ARTIST THREE", "ARTIST FOUR"];

export default function MediaPage() {
  return (
    <main className="flex flex-1 flex-col">
      <MediaHeroSection />
      <MediaGenreShowcaseSection />
      <MediaBrandContentSection />
      <MediaPhotoSection />
      <MarqueeTicker artistNames={marqueeArtistNames} tags={mediaTags} />
      <PressKitSection />
      <PressCoverageSection />
      <MediaStatsSection />
      <MediaCTASection />
      <Footer />
    </main>
  );
}
