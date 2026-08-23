import { Badge } from "./Badge";

// Mirrors ArtistCard.js's gradient-placeholder pattern: no real media
// assets exist yet, so `image` is a placeholder gradient div.
export function MediaCard({ item }) {
  const { title, type } = item;

  return (
    <div className="group relative aspect-3/4 w-64 sm:w-72 shrink-0 overflow-hidden border border-border bg-gradient-to-br from-surface-2 to-surface transition-colors duration-250 hover:border-accent">
      <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/30 to-transparent" />

      <div className="absolute top-3 left-3">
        <Badge variant="yellow">{type}</Badge>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-2xl leading-none tracking-display text-highlight uppercase">
          {title}
        </h3>
      </div>
    </div>
  );
}
