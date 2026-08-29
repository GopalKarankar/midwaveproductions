"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import { useTableQueryState } from "@/hooks/useTableQueryState";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { DataTableSortHeader } from "@/components/ui/DataTableSortHeader";
import { Badge } from "@/components/ui/Badge";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { SelectField } from "@/components/ui/SelectField";
import { ROLES } from "@/constants/roles";

const columnHelper = createColumnHelper();

function createLogColumns() {
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (statusCode) => {
    if (statusCode < 400) return "text-success";
    return "text-error";
  };

  return [
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: ({ column }) => <DataTableSortHeader column={column}>Time</DataTableSortHeader>,
      cell: (info) => <span className="text-sm font-mono text-muted">{formatTime(info.getValue())}</span>,
    }),
    columnHelper.accessor("method", {
      id: "method",
      header: "Method",
      cell: (info) => <span className="text-sm font-mono text-muted">{info.getValue()}</span>,
    }),
    columnHelper.accessor("path", {
      id: "path",
      header: "Endpoint",
      cell: (info) => (
        <span className="text-sm font-mono text-muted truncate max-w-xs" title={info.getValue()}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("statusCode", {
      id: "statusCode",
      header: ({ column }) => <DataTableSortHeader column={column}>Status</DataTableSortHeader>,
      cell: (info) => {
        const statusCode = info.getValue();
        return <span className={`text-sm font-mono font-bold ${getStatusColor(statusCode)}`}>{statusCode}</span>;
      },
    }),
    columnHelper.accessor("ip", {
      id: "ip",
      header: "IP",
      cell: (info) => <span className="text-sm font-mono text-muted">{info.getValue()}</span>,
    }),
    columnHelper.accessor("userId", {
      id: "userId",
      header: "User",
      cell: (info) => <span className="text-sm font-mono text-muted">{info.getValue() ? "•••" : "—"}</span>,
    }),
    columnHelper.display({
      id: "role",
      header: "Role",
      cell: (info) => {
        const log = info.row.original;
        return log.rateLimited ? (
          <Badge variant="yellow">RATE LIMITED</Badge>
        ) : log.userRole ? (
          <span className="font-mono text-xs uppercase tracking-widest text-muted">{log.userRole}</span>
        ) : (
          "—"
        );
      },
    }),
  ];
}

const METHODS = ["GET", "POST", "PATCH", "PUT", "DELETE"];

export function MonitoringLogsTable({ logs, page, pageSize, totalCount, sortField, sortDir }) {
  const [localLogs, setLocalLogs] = useState(logs);
  const { q, setParams, isPending } = useTableQueryState();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(q);
  const method = searchParams.get('method') || 'all';
  const role = searchParams.get('role') || 'all';

  // Resync when prop data changes
  useEffect(() => {
    setLocalLogs(logs);
  }, [logs]);

  const columns = useMemo(() => createLogColumns(), []);

  const sorting = sortField ? [{ id: sortField, desc: sortDir === 'desc' }] : [];

  const table = useReactTable({
    data: localLogs,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination: { pageIndex: page - 1, pageSize },
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex: page - 1, pageSize }) : updater;
      setParams({ page: next.pageIndex + 1 });
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setParams({ sort: next[0]?.id ?? '', dir: next[0]?.desc ? 'desc' : 'asc' });
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const methodOptions = [
    { value: 'all', label: 'All' },
    ...METHODS.map((m) => ({ value: m, label: m })),
  ];

  const roleOptions = [
    { value: 'all', label: 'All' },
    { value: 'system', label: 'System' },
    { value: ROLES.USER, label: 'User' },
    { value: ROLES.ARTIST, label: 'Artist' },
    { value: ROLES.MANAGER, label: 'Manager' },
    { value: ROLES.ADMIN, label: 'Admin' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <TableSearchInput
          value={searchValue}
          onChange={setSearchValue}
          onSearch={(v) => setParams({ q: v })}
          placeholder="Search by IP or path..."
        />

        <FilterTabs
          options={methodOptions}
          active={method}
          onChange={(value) => setParams({ method: value })}
        />

        <SelectField
          id="role-filter"
          label="Filter by Role"
          options={roleOptions}
          value={role}
          onChange={(e) => setParams({ role: e.target.value })}
        />
      </div>

      <DataTable table={table} isPending={isPending} emptyMessage="No API requests found." />

      <DataTablePagination
        page={page}
        pageCount={table.getPageCount()}
        totalCount={totalCount}
        onPageChange={(p) => setParams({ page: p })}
        pageSize={pageSize}
        onPageSizeChange={(size) => setParams({ pageSize: size, page: 1 })}
        isPending={isPending}
      />
    </div>
  );
}
