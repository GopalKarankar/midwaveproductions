import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { Footer } from "@/components/layout/Footer";
import { getLegalPages } from "@/lib/settings/getLegalPages";
import { sanitizeRichText } from "@/lib/utils/sanitizeRichText";

export const metadata = {
  title: "Terms & Conditions — Midwave Productions",
  description: "Terms and conditions for using Midwave Productions services.",
};

export default async function TermsPage() {
  const legalPages = await getLegalPages();
  const html = legalPages.terms ? sanitizeRichText(legalPages.terms) : null;

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
        {html ? (
          <div
            className="flex flex-col gap-4 max-w-2xl font-body text-text text-sm md:text-base leading-relaxed prose prose-invert max-w-none [&_p]:my-0 [&_p]:leading-relaxed [&_strong]:text-highlight [&_em]:text-text [&_u]:underline [&_a]:text-accent [&_a]:underline hover:[&_a]:no-underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:py-0 [&_blockquote]:italic [&_blockquote]:my-4 [&_h2]:text-2xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:my-4 [&_h3]:text-xl [&_h3]:font-display [&_h3]:font-bold [&_h3]:my-3"
            dangerouslySetInnerHTML={{ __html: html }}
          />
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
