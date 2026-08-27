'use client';

import { flexRender } from '@tanstack/react-table';

export function DataTable({
  table,
  isPending = false,
  renderSubRow,
  emptyMessage = 'No data found.',
  className = '',
}) {
  const { getHeaderGroups, getRowModel } = table;
  const rows = getRowModel().rows;

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          {getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-t-2 border-b border-border bg-surface">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-text"
                >
                  {header.isPlaceholder ? null : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className={isPending ? 'opacity-60' : ''}>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={table.getAllColumns().length} className="px-4 py-6 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-text">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
          {rows.length > 0 && rows.map((row) =>
            renderSubRow && row.getIsExpanded() ? (
              <tr key={`subrow-${row.id}`} className="border-b border-border bg-surface-2">
                <td colSpan={row.getVisibleCells().length} className="px-4 py-4">
                  {renderSubRow(row)}
                </td>
              </tr>
            ) : null
          )}
        </tbody>
      </table>
    </div>
  );
}
