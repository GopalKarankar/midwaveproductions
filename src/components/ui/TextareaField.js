// Bottom-border-only textarea — matches FormField styling, no box chrome.
export function TextareaField({ label, id, rows = 5, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-mono text-xs text-accent-2 tracking-widest uppercase"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className="bg-transparent border-0 border-b border-border text-text font-body py-2 focus:outline-none focus:border-accent transition-colors duration-200 placeholder:text-muted resize-none"
        {...props}
      />
    </div>
  );
}
