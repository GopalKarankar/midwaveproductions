// N°5 — About story
export function AboutStorySection({ paragraphs }) {
  return (
    <section className="px-6 md:px-12 py-12 border-t border-border">
      <h3 className="font-display text-2xl text-highlight uppercase tracking-display mb-6">
        Our Story
      </h3>
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
    </section>
  );
}
