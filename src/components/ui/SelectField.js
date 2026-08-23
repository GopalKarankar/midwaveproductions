// Bottom-border-only select — matches FormField styling, no box chrome.
export function SelectField({ label, id, options = [], placeholder, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-mono text-xs text-accent-2 tracking-widest uppercase"
      >
        {label}
      </label>
      <select
        id={id}
        className="bg-transparent border-0 border-b border-border text-text font-body py-2 focus:outline-none focus:border-accent transition-colors duration-200"
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
