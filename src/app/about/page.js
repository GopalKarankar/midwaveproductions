import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { AboutStorySection } from "@/components/sections/AboutStorySection";
import { AboutPillarsSection } from "@/components/sections/AboutPillarsSection";
import { Footer } from "@/components/layout/Footer";
import { getLegalPages, paragraphsFromText } from "@/lib/settings/getLegalPages";
import { aboutStory } from "@/lib/data/placeholderAbout";

export const metadata = {
  title: "About — Midwave Productions",
  description:
    "Who we are — Midwave Productions is an artist-run management and promotion company.",
};

export default async function AboutPage() {
  const legalPages = await getLegalPages();
  const dbParagraphs = legalPages.about
    ? paragraphsFromText(legalPages.about)
    : null;
  const paragraphs = dbParagraphs && dbParagraphs.length > 0 ? dbParagraphs : aboutStory;

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 md:px-12 pt-16 pb-8">
        <div className="flex items-start justify-between">
          <SectionNumber n="5" />
          <VersionLabel />
        </div>
        <SectionHeading>About Midwave</SectionHeading>
      </section>

      <AboutStorySection paragraphs={paragraphs} />
      <AboutPillarsSection />
      <Footer />
    </main>
  );
}
