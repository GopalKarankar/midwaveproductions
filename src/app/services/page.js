import { ServicesHeroSection } from "@/components/sections/ServicesHeroSection";
import { ServiceDetailsSection } from "@/components/sections/ServiceDetailsSection";
import { MarqueeTicker } from "@/components/layout/MarqueeTicker";
import { PricingBandSection } from "@/components/sections/PricingBandSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";
import { marqueeArtistNames, marqueeTags } from "@/lib/data/placeholderMarquee";

export const metadata = {
  title: "Services — Midwave Productions",
  description:
    "Artist management, promotion & PR, event booking, and media production services from Midwave Productions.",
};

export default function ServicesPage() {
  return (
    <main className="flex flex-1 flex-col">
      <ServicesHeroSection />
      <ServiceDetailsSection />
      <MarqueeTicker artistNames={marqueeArtistNames} tags={marqueeTags} />
      <PricingBandSection />
      <CTASection />
      <Footer />
    </main>
  );
}
