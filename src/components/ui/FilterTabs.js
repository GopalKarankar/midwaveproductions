'use client';

export function FilterTabs({ options, active, onChange, counts }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
            active === opt.value
              ? 'text-accent-2 border-b-2 border-accent-2'
              : 'text-muted hover:text-highlight border-b-2 border-transparent'
          }`}
        >
          {opt.label} {counts ? `(${counts[opt.value] || 0})` : null}
        </button>
      ))}
    </div>
  );
}
