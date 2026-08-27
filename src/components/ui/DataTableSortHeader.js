'use client';

export function DataTableSortHeader({ column, children }) {
  const getSortIcon = () => {
    if (column.getIsSorted() === 'asc') return ' ↑';
    if (column.getIsSorted() === 'desc') return ' ↓';
    return ' ↕';
  };

  return (
    <button
      onClick={column.getToggleSortingHandler()}
      className="inline-flex items-center gap-1 hover:text-accent cursor-pointer"
    >
      {children}
      <span className="text-accent-2">{getSortIcon()}</span>
    </button>
  );
}
