// Yellow Space Mono pill — used for genre tags, status labels
export function Badge({ children, variant = "yellow" }) {
  const variants = {
    yellow: "bg-accent-2 text-brand-black",
    blue: "bg-accent text-bg",
    muted: "bg-surface-2 text-muted border border-border",
  };
  return (
    <span
      className={`font-mono text-xs px-2 py-0.5 rounded-full uppercase tracking-widest ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
