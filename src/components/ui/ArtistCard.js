import { Badge } from "./Badge";
import { ArrowLink } from "./ArrowLink";

// Spec'd under "Artist Roster" in CLAUDE.md (not given as a literal code
// block there). Pure CSS group-hover — no client JS needed for the reveal.
// `image` is a placeholder gradient div: no real artist photos exist yet.
export function ArtistCard({ artist }) {
  const { stageName, genre, shortBio, slug } = artist;

  return (
    <div className="group relative aspect-3/4 w-64 sm:w-72 shrink-0 overflow-hidden border border-border bg-gradient-to-br from-surface-2 to-surface transition-colors duration-250 hover:border-accent">
      <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/30 to-transparent transition-opacity duration-300 group-hover:from-bg/95 group-hover:via-bg/60" />

      <div className="absolute top-3 left-3">
        <Badge variant="yellow">{genre}</Badge>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
        <h3 className="font-display text-2xl leading-none tracking-display text-highlight uppercase">
          {stageName}
        </h3>
        <p className="font-body text-xs text-muted max-w-[90%] translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {shortBio}
        </p>
        <ArrowLink
          href={`/artists/${slug}`}
          color="blue"
          className="translate-y-3 opacity-0 transition-all duration-300 delay-75 group-hover:translate-y-0 group-hover:opacity-100"
        >
          PROFILE
        </ArrowLink>
      </div>
    </div>
  );
}
