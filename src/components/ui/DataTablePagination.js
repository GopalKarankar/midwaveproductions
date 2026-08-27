'use client';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function DataTablePagination({
  page,
  pageCount,
  totalCount,
  onPageChange,
  pageSize = 20,
  onPageSizeChange,
  isPending = false,
}) {
  const canGoPrev = page > 1;
  const canGoNext = page < pageCount;

  return (
    <div className="flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-muted">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoPrev || isPending}
        className="px-3 py-2 text-text hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>
      <span className="text-text">
        Page {page} of {pageCount} • {totalCount} total
      </span>
      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className="text-muted">Rows</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isPending}
              className="bg-transparent border-0 border-b border-border text-text font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext || isPending}
          className="px-3 py-2 text-text hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
