// Bottom-border-only input — no box chrome, per Crevixa-style form spec.
export function FormField({ label, id, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-mono text-xs text-accent-2 tracking-widest uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        className="bg-transparent border-0 border-b border-border text-text font-body py-2 focus:outline-none focus:border-accent transition-colors duration-200 placeholder:text-muted"
        {...props}
      />
    </div>
  );
}
