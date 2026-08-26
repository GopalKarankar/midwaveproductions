import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedArtistsSection } from "@/components/sections/FeaturedArtistsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { MarqueeTicker } from "@/components/layout/MarqueeTicker";
import { BrandsSection } from "@/components/sections/BrandsSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth/getSession";
import {
  marqueeArtistNames,
  marqueeTags,
} from "@/lib/data/placeholderMarquee";

export default async function Home() {
  const { session } = await getSession();

  return (
    <main className="flex flex-1 flex-col">
      <HeroSection isAuthenticated={!!session} />
      <FeaturedArtistsSection />
      <ServicesSection />
      <StatsSection />
      <MarqueeTicker artistNames={marqueeArtistNames} tags={marqueeTags} />
      <BrandsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
