import { Badge } from "./Badge";
import { ArrowLink } from "./ArrowLink";

export function BlogPostCard({ post }) {
  const { title, excerpt, slug, coverImage, tags } = post;
  const firstTag = tags?.[0];

  return (
    <div className="group relative aspect-[4/5] overflow-hidden border border-border bg-gradient-to-br from-surface-2 to-surface transition-colors duration-250 hover:border-accent">
      {coverImage && (
        <img
          src={coverImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/40 to-transparent group-hover:from-bg/98 group-hover:via-bg/70 transition-opacity duration-300" />

      {firstTag && (
        <div className="absolute top-3 left-3">
          <Badge variant="yellow">{firstTag}</Badge>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
        <h3 className="font-display text-xl leading-none tracking-display text-highlight uppercase line-clamp-3">
          {title}
        </h3>
        <p className="font-body text-xs text-muted max-w-[90%] translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 line-clamp-2">
          {excerpt}
        </p>
        <ArrowLink
          href={`/blog/${slug}`}
          color="blue"
          className="translate-y-3 opacity-0 transition-all duration-300 delay-75 group-hover:translate-y-0 group-hover:opacity-100"
        >
          READ MORE
        </ArrowLink>
      </div>
    </div>
  );
}
