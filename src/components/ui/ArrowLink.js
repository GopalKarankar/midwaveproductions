// Text-only link with ↗ or ↓ suffix — no button chrome.
// `color` swaps the base color pair instead of relying on an appended
// className to win the cascade (two same-specificity utilities don't
// reliably override each other based on className order).
const COLORS = {
  blue: "text-accent hover:text-accent-hover",
  yellow: "text-accent-2 hover:text-accent-2-hover",
  black: "text-brand-black hover:text-brand-black/70",
};

export function ArrowLink({
  href,
  children,
  direction = "↗",
  className = "",
  color = "blue",
}) {
  return (
    <a
      href={href}
      className={`font-mono text-xs ${COLORS[color]} tracking-widest uppercase transition-colors duration-200 ${className}`}
    >
      {children} {direction}
    </a>
  );
}
