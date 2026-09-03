"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import { useTableQueryState } from "@/hooks/useTableQueryState";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { Badge } from "@/components/ui/Badge";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { SelectField } from "@/components/ui/SelectField";

const STATUSES = ["open", "investigating", "resolved", "wont_fix"];
const CATEGORIES = ["bug", "ui_issue", "account", "booking", "payment", "other"];
const SEVERITIES = ["low", "medium", "high", "critical"];

const STATUS_COLORS = {
  open: "text-accent",
  investigating: "text-accent-2",
  resolved: "text-success",
  wont_fix: "text-muted",
};

const SEVERITY_COLORS = {
  low: "text-muted",
  medium: "text-accent-2",
  high: "text-error",
  critical: "text-error",
};

const columnHelper = createColumnHelper();

function createProblemReportColumns() {
  return [
    columnHelper.accessor("name", {
      id: "name",
      header: "Name",
      cell: (info) => <span className="font-body text-highlight">{info.getValue()}</span>,
    }),
    columnHelper.accessor("email", {
      id: "email",
      header: "Email",
      cell: (info) => <span className="font-body text-muted text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor("category", {
      id: "category",
      header: "Category",
      cell: (info) => <span className="font-body text-muted text-xs capitalize">{info.getValue().replace(/_/g, " ")}</span>,
    }),
    columnHelper.accessor("severity", {
      id: "severity",
      header: "Severity",
      cell: (info) => {
        const severity = info.getValue();
        return <span className={`font-body text-xs uppercase font-mono ${SEVERITY_COLORS[severity]}`}>{severity}</span>;
      },
    }),
    columnHelper.accessor("message", {
      id: "message",
      header: "Message",
      cell: (info) => {
        const msg = info.getValue();
        const truncated = msg && msg.length > 50 ? msg.substring(0, 50) + "…" : msg || "—";
        return (
          <span className="font-body text-muted text-xs" title={msg || ""}>
            {truncated}
          </span>
        );
      },
    }),
    columnHelper.accessor("pageUrl", {
      id: "pageUrl",
      header: "Page URL",
      cell: (info) => {
        const url = info.getValue();
        if (!url) return <span className="font-body text-muted text-xs">—</span>;
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-body text-accent text-xs hover:underline">
            {url.length > 30 ? url.substring(0, 30) + "…" : url}
          </a>
        );
      },
    }),
    columnHelper.accessor("adminNotes", {
      id: "adminNotes",
      header: "Admin Notes",
      cell: (info) => {
        const reportId = info.row.original._id;
        const { notesDraft, onNotesChange, onNotesSave, savingNotesId } = info.table.options.meta;
        const value = notesDraft[reportId] || "";
        const isSaving = savingNotesId === reportId;

        return (
          <textarea
            value={value}
            onChange={(e) => onNotesChange(reportId, e.target.value)}
            onBlur={() => onNotesSave(reportId)}
            disabled={isSaving}
            maxLength={2000}
            rows={2}
            placeholder="Internal notes..."
            className="bg-transparent border-0 border-b border-border text-text font-body py-1 text-xs focus:outline-none focus:border-accent transition-colors duration-200 placeholder:text-muted w-full resize-none disabled:opacity-50"
          />
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: "Date",
      cell: (info) => {
        const date = info.getValue();
        return (
          <span className="font-body text-muted text-xs">
            {date ? new Date(date).toLocaleDateString() : "—"}
          </span>
        );
      },
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: "Status",
      cell: (info) => {
        const reportId = info.row.original._id;
        const currentStatus = info.getValue();
        const { updatingId, onStatusChange } = info.table.options.meta;
        const isUpdating = updatingId === reportId;

        return (
          <div className="flex items-center gap-2">
            <select
              value={currentStatus}
              onChange={(e) => onStatusChange(reportId, e.target.value)}
              disabled={isUpdating}
              className={`bg-transparent border border-border px-2 py-1 text-xs font-mono uppercase tracking-widest rounded cursor-pointer disabled:opacity-50 ${
                STATUS_COLORS[currentStatus]
              }`}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            {isUpdating && <span className="text-xs text-muted">Updating...</span>}
          </div>
        );
      },
    }),
  ];
}

export function ProblemReportsAdminTable({
  reports,
  page,
  pageSize,
  totalCount,
  statusCounts,
}) {
  const [localReports, setLocalReports] = useState(reports);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notesDraft, setNotesDraft] = useState({});
  const [savingNotesId, setSavingNotesId] = useState(null);
  const { status, setParams, isPending } = useTableQueryState();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    setLocalReports(reports);
    setNotesDraft(reports.reduce((acc, r) => {
      acc[r._id] = r.adminNotes || "";
      return acc;
    }, {}));
  }, [reports]);

  const activeTab = status === "all" ? "all" : status;

  const updateStatus = async (reportId, newStatus) => {
    const currentReport = localReports.find((r) => r._id === reportId);
    if (currentReport.status === newStatus) return;

    setUpdatingId(reportId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/problem-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to update");
        return;
      }

      const { report } = await response.json();
      setLocalReports((prev) =>
        prev.map((r) => (r._id === reportId ? report : r))
      );
    } catch (err) {
      console.error("Error updating report:", err);
      setErrorMessage("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveAdminNotes = async (reportId) => {
    const currentNotes = notesDraft[reportId] || "";
    const currentReport = localReports.find((r) => r._id === reportId);
    const savedNotes = currentReport.adminNotes || "";

    if (currentNotes === savedNotes) return;

    setSavingNotesId(reportId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/problem-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: currentNotes }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to update notes");
        return;
      }

      const { report } = await response.json();
      setLocalReports((prev) =>
        prev.map((r) => (r._id === reportId ? report : r))
      );
      setNotesDraft((prev) => ({
        ...prev,
        [reportId]: report.adminNotes || "",
      }));
    } catch (err) {
      console.error("Error updating notes:", err);
      setErrorMessage("Failed to update notes");
    } finally {
      setSavingNotesId(null);
    }
  };

  const columns = useMemo(() => createProblemReportColumns(), []);

  const table = useReactTable({
    data: localReports,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination: { pageIndex: page - 1, pageSize },
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex: page - 1, pageSize }) : updater;
      setParams({ page: next.pageIndex + 1 });
    },
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updatingId,
      onStatusChange: updateStatus,
      notesDraft,
      onNotesChange: (id, value) => setNotesDraft((prev) => ({ ...prev, [id]: value })),
      onNotesSave: saveAdminNotes,
      savingNotesId,
    },
  });

  const statusOptions = [
    { value: 'all', label: 'All' },
    ...STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
  ];

  const categoryOptions = [
    { value: 'all', label: 'All' },
    ...CATEGORIES.map((c) => ({ value: c, label: c.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()) })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <FilterTabs
          options={statusOptions}
          active={activeTab}
          onChange={(value) => setParams({ status: value })}
          counts={statusCounts}
        />

        <SelectField
          id="category-filter"
          label="Filter by Category"
          options={categoryOptions}
          value={category}
          onChange={(e) => setParams({ category: e.target.value })}
        />
      </div>

      {errorMessage && (
        <p className="font-mono text-xs text-error tracking-widest uppercase">
          {errorMessage}
        </p>
      )}

      <DataTable table={table} isPending={isPending} emptyMessage="No problem reports found." />

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
