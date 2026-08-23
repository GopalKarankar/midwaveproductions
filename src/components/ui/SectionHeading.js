// Bebas Neue, full caps, highlight color
export function SectionHeading({ children, className = "" }) {
  return (
    <h2
      className={`font-display text-5xl md:text-7xl text-highlight tracking-display uppercase leading-none ${className}`}
    >
      {children}
    </h2>
  );
}
