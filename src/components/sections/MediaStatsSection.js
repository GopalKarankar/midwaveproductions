import { StatCounter } from "@/components/media/StatCounter";

const mediaStats = [
  { label: "MUSIC VIDEOS PRODUCED", value: 50, suffix: "+" },
  { label: "PRESS FEATURES", value: 200, suffix: "+" },
  { label: "ARTISTS REPRESENTED", value: 15, suffix: "+" },
];

// N°5 — Stats band. Server Component; only the number itself is a client island.
export function MediaStatsSection() {
  return (
    <section className="bg-surface border-y border-border grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-border">
      {mediaStats.map((stat) => (
        <div key={stat.label} className="p-8 md:p-12 text-center flex flex-col items-center gap-2">
          <StatCounter value={stat.value} suffix={stat.suffix} />
          <span className="font-mono text-xs text-accent-2 tracking-widest uppercase mt-2">
            {stat.label}
          </span>
        </div>
      ))}
    </section>
  );
}
