// V#001 label — placed in hero top-right and footer bottom-right
export function VersionLabel({ version = "001", year = "2024", variant = "sm" }) {
  if (variant === "lg") {
    return (
      <span className="font-display text-2xl text-highlight tracking-display">
        V#{version}
      </span>
    );
  }
  return (
    <span className="font-mono text-xs text-muted tracking-widest">
      V#{version} {year}
    </span>
  );
}
