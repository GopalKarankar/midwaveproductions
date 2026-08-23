// Reusable button for primary CTAs — square corners, Space Mono chip style,
// consistent with GoogleSignInButton's hover-sweep pattern (via CSS, not Framer).
const variants = {
  solid: "bg-accent text-bg border border-accent hover:bg-accent-hover hover:border-accent-hover",
  outline: "bg-transparent text-highlight border border-highlight hover:text-accent hover:border-accent",
};

export function Button({
  href,
  children,
  variant = "solid",
  className = "",
}) {
  return (
    <a
      href={href}
      className={`inline-block font-mono text-xs px-4 py-2 uppercase tracking-widest border transition-colors duration-300 ease-brand ${variants[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
