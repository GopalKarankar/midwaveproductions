'use client';

import { useCallback, useEffect, useRef } from 'react';

export function TableSearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 400,
}) {
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    // Clear any pending debounce on unmount
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      onChange(newValue);

      // Clear previous debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce
      debounceTimerRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
    },
    [onChange, onSearch, debounceMs]
  );

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full border-b border-border bg-transparent px-0 py-2 font-body text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
    />
  );
}
