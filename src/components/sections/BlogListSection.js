import Link from "next/link";
import { BlogPostCard } from "@/components/ui/BlogPostCard";

export function BlogListSection({ posts, tags, activeTag, page, pageCount }) {
  const allTags = ["ALL", ...tags];

  return (
    <section className="flex flex-col gap-8 px-6 md:px-12 py-12">
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isActive = activeTag === tag || (!activeTag && tag === "ALL");
          const href = tag === "ALL" ? "/blog" : `/blog?tag=${encodeURIComponent(tag)}`;

          return (
            <Link
              key={tag}
              href={href}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-widest rounded transition-all ${
                isActive
                  ? "bg-accent-2 text-bg"
                  : "border border-border text-muted hover:text-accent hover:border-accent"
              }`}
            >
              {tag}
            </Link>
          );
        })}
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-muted py-8">No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogPostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-8 border-t border-border">
        {page > 1 ? (
          <Link
            href={`/blog${activeTag ? `?tag=${encodeURIComponent(activeTag)}&` : "?"}page=${page - 1}`}
            className="font-mono text-xs text-accent hover:text-accent-hover uppercase tracking-widest"
          >
            ← PREVIOUS
          </Link>
        ) : (
          <div />
        )}

        <span className="font-mono text-xs text-muted uppercase tracking-widest">
          Page {page} of {pageCount}
        </span>

        {page < pageCount ? (
          <Link
            href={`/blog${activeTag ? `?tag=${encodeURIComponent(activeTag)}&` : "?"}page=${page + 1}`}
            className="font-mono text-xs text-accent hover:text-accent-hover uppercase tracking-widest"
          >
            NEXT →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </section>
  );
}
