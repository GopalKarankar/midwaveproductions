export function GoogleSignInButton({ label = 'SIGN IN WITH GOOGLE', className = '' }) {
  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <a
        href="/api/auth/google/authorize"
        className="relative inline-block w-full px-5 py-2 border border-brand-black font-display uppercase tracking-display text-highlight transition-colors duration-300"
      >
        {/* Hover sweep background — scales in from left */}
        <div className="absolute inset-0 bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-brand pointer-events-none" />
        {/* Text label — stacked above background, switches color on hover */}
        <span className="relative z-10 group-hover:text-brand-black transition-colors duration-300">
          {label}
        </span>
      </a>
    </div>
  );
}
