import { paragraphsFromText } from "@/lib/utils/paragraphsFromText";

// N°5 — About story
export function AboutStorySection({ html, fallbackParagraphs, paragraphs }) {
  const content = html || fallbackParagraphs || paragraphs;
  const isHtml = html && !paragraphs;

  return (
    <section className="px-6 md:px-12 py-12 border-t border-border">
      <h3 className="font-display text-2xl text-highlight uppercase tracking-display mb-6">
        Our Story
      </h3>
      {isHtml ? (
        <div
          className="flex flex-col gap-4 max-w-2xl font-body text-text text-sm md:text-base leading-relaxed prose prose-invert max-w-none [&_p]:my-0 [&_p]:leading-relaxed [&_strong]:text-highlight [&_em]:text-text [&_u]:underline [&_a]:text-accent [&_a]:underline hover:[&_a]:no-underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:py-0 [&_blockquote]:italic [&_blockquote]:my-4 [&_h2]:text-2xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:my-4 [&_h3]:text-xl [&_h3]:font-display [&_h3]:font-bold [&_h3]:my-3"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="flex flex-col gap-4 max-w-2xl">
          {content.map((paragraph, index) => (
            <p
              key={index}
              className="font-body text-text text-sm md:text-base leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
