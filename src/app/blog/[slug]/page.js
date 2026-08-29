import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Footer } from "@/components/layout/Footer";
import { getPublishedPostBySlug } from "@/lib/blog/getBlogPosts";
import { sanitizeRichText } from "@/lib/utils/sanitizeRichText";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Midwave Productions`,
    description: post.excerpt,
  };
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const firstTag = post.tags?.[0];
  const publishedDate = post.publishedAt ? dateFormatter.format(new Date(post.publishedAt)) : null;

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative flex min-h-96 flex-col justify-end overflow-hidden bg-gradient-to-br from-surface-2 to-surface px-6 md:px-12 py-10">
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="relative flex flex-col items-start gap-4">
          {firstTag && <Badge variant="yellow">{firstTag}</Badge>}
          <h1 className="font-display text-5xl md:text-6xl leading-none tracking-display uppercase text-highlight">
            {post.title}
          </h1>
          {publishedDate && (
            <p className="font-mono text-xs text-muted tracking-widest uppercase">
              {publishedDate}
            </p>
          )}
        </div>
      </section>

      <section className="px-6 md:px-12 py-16 max-w-3xl">
        <div
          className="flex flex-col gap-6 font-body text-text leading-relaxed prose prose-invert max-w-none [&_p]:my-0 [&_p]:leading-relaxed [&_strong]:text-highlight [&_em]:text-text [&_u]:underline [&_a]:text-accent [&_a]:underline hover:[&_a]:no-underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:py-0 [&_blockquote]:italic [&_blockquote]:my-4 [&_h2]:text-2xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:my-4 [&_h3]:text-xl [&_h3]:font-display [&_h3]:font-bold [&_h3]:my-3"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.body) }}
        />
      </section>

      <section className="bg-brand-blue px-6 md:px-12 py-16">
        <div className="flex flex-col gap-4 items-start">
          <p className="font-body text-bg text-lg">
            Interested in working with Midwave Productions?
          </p>
          <ArrowLink href="/booking" color="black">
            GET IN TOUCH
          </ArrowLink>
        </div>
      </section>

      <Footer />
    </main>
  );
}
