import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { Footer } from "@/components/layout/Footer";
import { getLegalPages, paragraphsFromText } from "@/lib/settings/getLegalPages";

export const metadata = {
  title: "Terms & Conditions — Midwave Productions",
  description: "Terms and conditions for using Midwave Productions services.",
};

export default async function TermsPage() {
  const legalPages = await getLegalPages();
  const paragraphs = legalPages.terms ? paragraphsFromText(legalPages.terms) : null;

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 md:px-12 pt-16 pb-8">
        <div className="flex items-start justify-between">
          <SectionNumber n="6" />
          <VersionLabel />
        </div>
        <SectionHeading>Terms & Conditions</SectionHeading>
      </section>

      <section className="px-6 md:px-12 py-12 border-t border-border">
        {paragraphs && paragraphs.length > 0 ? (
          <div className="flex flex-col gap-4 max-w-2xl">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="font-body text-text text-sm md:text-base leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="font-body text-muted text-sm md:text-base leading-relaxed max-w-2xl">
            Content coming soon.
          </p>
        )}
      </section>

      <Footer />
    </main>
  );
}
