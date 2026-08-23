import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { ArtistRosterSection } from "@/components/sections/ArtistRosterSection";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Artist Roster — Midwave Productions",
  description: "Showcase & archive of artists managed by Midwave Productions.",
};

export default function ArtistsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 md:px-12 pt-16 pb-8">
        <div className="flex items-start justify-between">
          <SectionNumber n="1" />
          <VersionLabel />
        </div>
        <SectionHeading>Artist Roster</SectionHeading>
      </section>

      <ArtistRosterSection />
      <Footer />
    </main>
  );
}
