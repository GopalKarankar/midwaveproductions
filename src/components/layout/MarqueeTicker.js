// Dual-row opposing marquee. Row 1: blue artist names. Row 2: yellow tags.
// Pure CSS animation — no client state needed.
export function MarqueeTicker({ artistNames = [], tags = [] }) {
  const row1 = [...artistNames, ...artistNames]; // duplicate for seamless loop
  const row2 = [...tags, ...tags];

  return (
    <div className="bg-surface overflow-hidden py-3 border-y border-border select-none">
      <div className="flex whitespace-nowrap animate-marquee-left gap-12 mb-2">
        {row1.map((name, i) => (
          <span
            key={i}
            className="font-display text-accent text-2xl tracking-display uppercase shrink-0"
          >
            {name}
          </span>
        ))}
      </div>
      <div className="flex whitespace-nowrap animate-marquee-right gap-12">
        {row2.map((tag, i) => (
          <span
            key={i}
            className="font-mono text-accent-2 text-xs tracking-widest uppercase shrink-0"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
