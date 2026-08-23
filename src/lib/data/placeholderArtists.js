// TEMP: placeholder data pending /api/artists integration
// (MongoDB Artist model — see CLAUDE.md Data Architecture).
export const placeholderArtists = [
  {
    id: "1",
    slug: "nova-reyes",
    stageName: "NOVA REYES",
    genre: "POP",
    shortBio: "Genre-bending pop with a live-band edge.",
    bio: "Nova Reyes writes pop songs the way most people write diary entries — fast, unfiltered, and built to be shouted back in a room full of strangers. Raised on both church choir and late-night radio, her sets pair a full live band with the kind of hooks that outlast the encore.",
    socialLinks: {
      instagram: "https://instagram.com",
      spotify: "https://open.spotify.com",
      youtube: "https://youtube.com",
    },
    featuredTracks: [
      { title: "Halfway Gone", platform: "spotify" },
      { title: "Static Bloom", platform: "spotify" },
    ],
    upcomingEvents: [
      { title: "Nova Reyes Live", date: "2026-09-12", venue: "The Hollow", city: "Austin, TX", ticketUrl: "#" },
      { title: "Coastline Festival", date: "2026-10-04", venue: "Pier 9 Amphitheater", city: "San Diego, CA", ticketUrl: "#" },
    ],
  },
  {
    id: "2",
    slug: "kilo-vance",
    stageName: "KILO VANCE",
    genre: "HIP HOP",
    shortBio: "Sharp bars, heavier production, no filler.",
    bio: "Kilo Vance treats a verse like an argument he's already won. Three independent tapes deep, his catalogue leans on dense, low-end-heavy production and a delivery that never wastes a bar. No features, no filler — just the case for why he's next.",
    socialLinks: {
      instagram: "https://instagram.com",
      spotify: "https://open.spotify.com",
      soundcloud: "https://soundcloud.com",
    },
    featuredTracks: [
      { title: "No Ceiling", platform: "soundcloud" },
      { title: "Concrete Season", platform: "spotify" },
    ],
    upcomingEvents: [
      { title: "Kilo Vance: No Ceiling Tour", date: "2026-09-20", venue: "The Underground", city: "Atlanta, GA", ticketUrl: "#" },
    ],
  },
  {
    id: "3",
    slug: "faye-lark",
    stageName: "FAYE LARK",
    genre: "INDIE",
    shortBio: "Bedroom-pop songwriting turned festival-ready.",
    bio: "Faye Lark started recording in a closet with a laptop mic and never really left that intimacy behind — even now that the songs fill festival fields. Her records sit somewhere between a whispered secret and a singalong, often at the same time.",
    socialLinks: {
      instagram: "https://instagram.com",
      spotify: "https://open.spotify.com",
      website: "https://midwaveproductions.com",
    },
    featuredTracks: [
      { title: "Paper Weather", platform: "spotify" },
      { title: "Slow Static", platform: "spotify" },
      { title: "Closet Tapes, Pt. 2", platform: "soundcloud" },
    ],
    upcomingEvents: [
      { title: "Faye Lark — Acoustic Set", date: "2026-09-06", venue: "Green Room", city: "Portland, OR", ticketUrl: "#" },
    ],
  },
  {
    id: "4",
    slug: "dust-and-static",
    stageName: "DUST & STATIC",
    genre: "ELECTRONIC",
    shortBio: "Analog synths, four-piece live electronic set.",
    bio: "Dust & Static build every set from hardware, not laptops — four members, a wall of analog synths, and no backing track to hide behind. Their live shows have a reputation for turning a room of listeners into a room of dancers within one song.",
    socialLinks: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      soundcloud: "https://soundcloud.com",
    },
    featuredTracks: [
      { title: "Voltage Bloom", platform: "soundcloud" },
      { title: "Analog Dusk", platform: "youtube" },
    ],
    upcomingEvents: [
      { title: "Dust & Static Live", date: "2026-09-27", venue: "Warehouse 12", city: "Detroit, MI", ticketUrl: "#" },
      { title: "Midnight Circuit Fest", date: "2026-11-01", venue: "Riverside Grounds", city: "Chicago, IL", ticketUrl: "#" },
    ],
  },
  {
    id: "5",
    slug: "sable-rowe",
    stageName: "SABLE ROWE",
    genre: "POP",
    shortBio: "Cinematic pop hooks with a torch-song core.",
    bio: "Sable Rowe writes the kind of pop songs that feel bigger than the room they're played in — string arrangements, torch-song vocals, choruses built for a last-call encore. A songwriter first, a performer close behind.",
    socialLinks: {
      instagram: "https://instagram.com",
      spotify: "https://open.spotify.com",
    },
    featuredTracks: [{ title: "Last Call", platform: "spotify" }],
    upcomingEvents: [
      { title: "Sable Rowe Live", date: "2026-10-15", venue: "The Ballroom", city: "Nashville, TN", ticketUrl: "#" },
    ],
  },
  {
    id: "6",
    slug: "trenches",
    stageName: "TRENCHES",
    genre: "HIP HOP",
    shortBio: "Duo built on tag-team verses and live drums.",
    bio: "Trenches trade verses like a two-man relay — one MC building the case, the other closing it, live drums under both. What started as a freestyle duo has become one of the tightest live hip hop acts on the circuit.",
    socialLinks: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
    },
    featuredTracks: [
      { title: "Relay", platform: "youtube" },
      { title: "Two Man Weight", platform: "spotify" },
    ],
    upcomingEvents: [],
  },
  {
    id: "7",
    slug: "marlow-quinn",
    stageName: "MARLOW QUINN",
    genre: "INDIE",
    shortBio: "Jangle-pop guitars, unhurried melodies.",
    bio: "Marlow Quinn writes songs the way a good conversation runs — unhurried, a little meandering, always landing somewhere worth remembering. Jangle-pop guitars, warm tape hiss, and melodies that take their time.",
    socialLinks: {
      instagram: "https://instagram.com",
      spotify: "https://open.spotify.com",
      soundcloud: "https://soundcloud.com",
    },
    featuredTracks: [{ title: "Take Your Time", platform: "spotify" }],
    upcomingEvents: [
      { title: "Marlow Quinn — In the Round", date: "2026-09-18", venue: "Cactus Club", city: "San Jose, CA", ticketUrl: "#" },
    ],
  },
  {
    id: "8",
    slug: "vela-current",
    stageName: "VELA CURRENT",
    genre: "ELECTRONIC",
    shortBio: "Ambient-leaning techno, built for long sets.",
    bio: "Vela Current builds sets in long, patient arcs — ambient textures that slowly tighten into techno without ever announcing the turn. Made for rooms that want to lose track of time.",
    socialLinks: {
      soundcloud: "https://soundcloud.com",
      instagram: "https://instagram.com",
    },
    featuredTracks: [
      { title: "Long Arc", platform: "soundcloud" },
      { title: "Current State", platform: "soundcloud" },
    ],
    upcomingEvents: [
      { title: "Vela Current: Long Sets", date: "2026-10-25", venue: "The Basement", city: "Brooklyn, NY", ticketUrl: "#" },
    ],
  },
];

export const artistGenres = [...new Set(placeholderArtists.map((a) => a.genre))];

export function getArtistBySlug(slug) {
  return placeholderArtists.find((a) => a.slug === slug);
}
