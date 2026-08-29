import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Footer } from "@/components/layout/Footer";
import { sanitizeRichText } from "@/lib/utils/sanitizeRichText";
import {
  placeholderArtists,
  getArtistBySlug,
} from "@/lib/data/placeholderArtists";

export function generateStaticParams() {
  return placeholderArtists.map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);
  if (!artist) return {};
  return {
    title: `${artist.stageName} — Midwave Productions`,
    description: artist.shortBio,
  };
}

const SOCIAL_LABELS = {
  instagram: "INSTAGRAM",
  spotify: "SPOTIFY",
  youtube: "YOUTUBE",
  soundcloud: "SOUNDCLOUD",
  twitter: "TWITTER",
  website: "WEBSITE",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default async function ArtistProfilePage({ params }) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);
  if (!artist) notFound();

  const {
    id,
    stageName,
    genre,
    bio,
    socialLinks = {},
    featuredTracks = [],
    upcomingEvents = [],
  } = artist;

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative flex h-svh flex-col justify-end overflow-hidden bg-gradient-to-br from-surface-2 to-surface px-6 md:px-12 py-10">
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="relative flex flex-col items-start gap-4">
          <Badge variant="yellow">{genre}</Badge>
          <h1 className="font-display text-6xl md:text-7xl leading-none tracking-display uppercase text-highlight">
            {stageName}
          </h1>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 flex flex-col gap-3">
          <span className="font-mono text-xs text-accent-2 tracking-widest uppercase">
            Bio
          </span>
          <div
            className="font-body text-text max-w-2xl leading-relaxed prose prose-invert max-w-none [&_p]:my-0 [&_p]:leading-relaxed [&_strong]:text-highlight [&_em]:text-text [&_u]:underline [&_a]:text-accent [&_a]:underline hover:[&_a]:no-underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:py-0 [&_blockquote]:italic [&_blockquote]:my-4 [&_h2]:text-2xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:my-4 [&_h3]:text-xl [&_h3]:font-display [&_h3]:font-bold [&_h3]:my-3"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(bio) }}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs text-accent-2 tracking-widest uppercase">
            Social Links
          </span>
          <ul className="flex flex-col gap-2">
            {Object.entries(socialLinks).map(([platform, href]) => (
              <li key={platform}>
                <ArrowLink href={href} color="blue">
                  {SOCIAL_LABELS[platform] ?? platform.toUpperCase()}
                </ArrowLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {featuredTracks.length > 0 && (
        <section className="border-t border-border px-6 md:px-12 py-16">
          <span className="font-mono text-xs text-accent-2 tracking-widest uppercase">
            Tracks
          </span>
          <ul className="mt-6 flex flex-col divide-y divide-border">
            {featuredTracks.map((track) => (
              <li
                key={track.title}
                className="flex items-center justify-between gap-4 py-4"
              >
                <span className="font-display text-2xl tracking-display uppercase text-highlight">
                  {track.title}
                </span>
                <Badge variant="muted">{track.platform}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {upcomingEvents.length > 0 && (
        <section className="border-t border-border px-6 md:px-12 py-16">
          <span className="font-mono text-xs text-accent-2 tracking-widest uppercase">
            Upcoming Events
          </span>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="font-mono text-xs text-muted tracking-widest uppercase border-b border-border">
                  <th className="py-3 pr-4 font-normal">Date</th>
                  <th className="py-3 pr-4 font-normal">Venue</th>
                  <th className="py-3 pr-4 font-normal">City</th>
                  <th className="py-3 pr-4 font-normal">Tickets</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((event) => (
                  <tr
                    key={event.title}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-4 pr-4 font-mono text-sm text-text">
                      {dateFormatter.format(new Date(event.date))}
                    </td>
                    <td className="py-4 pr-4 font-body text-sm text-text">
                      {event.venue}
                    </td>
                    <td className="py-4 pr-4 font-body text-sm text-muted">
                      {event.city}
                    </td>
                    <td className="py-4 pr-4">
                      <ArrowLink href={event.ticketUrl} color="blue">
                        TICKETS
                      </ArrowLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="bg-brand-blue px-6 md:px-12 py-24">
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="font-display text-5xl md:text-6xl tracking-display uppercase text-bg leading-none">
            Book {stageName}
          </h2>
          <ArrowLink
            href={`/booking?artist=${id}`}
            color="black"
            className="underline underline-offset-4"
          >
            SEND INQUIRY
          </ArrowLink>
        </div>
      </section>

      <Footer />
    </main>
  );
}
