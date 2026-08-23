// Renders "N°X" label — yellow, Space Mono, top of every section
export function SectionNumber({ n }) {
  return (
    <span className="font-mono text-accent-2 text-xs tracking-widest uppercase">
      N°{n}
    </span>
  );
}
