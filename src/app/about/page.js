import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { AboutStorySection } from "@/components/sections/AboutStorySection";
import { AboutPillarsSection } from "@/components/sections/AboutPillarsSection";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "About — Midwave Productions",
  description:
    "Who we are — Midwave Productions is an artist-run management and promotion company.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 md:px-12 pt-16 pb-8">
        <div className="flex items-start justify-between">
          <SectionNumber n="5" />
          <VersionLabel />
        </div>
        <SectionHeading>About Midwave</SectionHeading>
      </section>

      <AboutStorySection />
      <AboutPillarsSection />
      <Footer />
    </main>
  );
}
