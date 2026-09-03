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

const STATUSES = ["new", "reviewed", "archived"];
const CATEGORIES = ["general", "feature_request", "praise", "other"];

const STATUS_COLORS = {
  new: "text-accent",
  reviewed: "text-success",
  archived: "text-muted",
};

const columnHelper = createColumnHelper();

function createFeedbackColumns() {
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
      cell: (info) => <span className="font-body text-muted text-xs capitalize">{info.getValue()}</span>,
    }),
    columnHelper.accessor("rating", {
      id: "rating",
      header: "Rating",
      cell: (info) => {
        const rating = info.getValue();
        return <span className="font-body text-muted text-xs">{rating ? `${rating}/5` : "—"}</span>;
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
    columnHelper.accessor("adminNotes", {
      id: "adminNotes",
      header: "Admin Notes",
      cell: (info) => {
        const feedbackId = info.row.original._id;
        const { notesDraft, onNotesChange, onNotesSave, savingNotesId } = info.table.options.meta;
        const value = notesDraft[feedbackId] || "";
        const isSaving = savingNotesId === feedbackId;

        return (
          <textarea
            value={value}
            onChange={(e) => onNotesChange(feedbackId, e.target.value)}
            onBlur={() => onNotesSave(feedbackId)}
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
        const feedbackId = info.row.original._id;
        const currentStatus = info.getValue();
        const { updatingId, onStatusChange } = info.table.options.meta;
        const isUpdating = updatingId === feedbackId;

        return (
          <div className="flex items-center gap-2">
            <select
              value={currentStatus}
              onChange={(e) => onStatusChange(feedbackId, e.target.value)}
              disabled={isUpdating}
              className={`bg-transparent border border-border px-2 py-1 text-xs font-mono uppercase tracking-widest rounded cursor-pointer disabled:opacity-50 ${
                STATUS_COLORS[currentStatus]
              }`}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
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

export function FeedbackAdminTable({
  feedbacks,
  page,
  pageSize,
  totalCount,
  statusCounts,
}) {
  const [localFeedbacks, setLocalFeedbacks] = useState(feedbacks);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notesDraft, setNotesDraft] = useState({});
  const [savingNotesId, setSavingNotesId] = useState(null);
  const { status, setParams, isPending } = useTableQueryState();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    setLocalFeedbacks(feedbacks);
    setNotesDraft(feedbacks.reduce((acc, f) => {
      acc[f._id] = f.adminNotes || "";
      return acc;
    }, {}));
  }, [feedbacks]);

  const activeTab = status === "all" ? "all" : status;

  const updateStatus = async (feedbackId, newStatus) => {
    const currentFeedback = localFeedbacks.find((f) => f._id === feedbackId);
    if (currentFeedback.status === newStatus) return;

    setUpdatingId(feedbackId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to update");
        return;
      }

      const { feedback } = await response.json();
      setLocalFeedbacks((prev) =>
        prev.map((f) => (f._id === feedbackId ? feedback : f))
      );
    } catch (err) {
      console.error("Error updating feedback:", err);
      setErrorMessage("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveAdminNotes = async (feedbackId) => {
    const currentNotes = notesDraft[feedbackId] || "";
    const currentFeedback = localFeedbacks.find((f) => f._id === feedbackId);
    const savedNotes = currentFeedback.adminNotes || "";

    if (currentNotes === savedNotes) return;

    setSavingNotesId(feedbackId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: currentNotes }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to update notes");
        return;
      }

      const { feedback } = await response.json();
      setLocalFeedbacks((prev) =>
        prev.map((f) => (f._id === feedbackId ? feedback : f))
      );
      setNotesDraft((prev) => ({
        ...prev,
        [feedbackId]: feedback.adminNotes || "",
      }));
    } catch (err) {
      console.error("Error updating notes:", err);
      setErrorMessage("Failed to update notes");
    } finally {
      setSavingNotesId(null);
    }
  };

  const columns = useMemo(() => createFeedbackColumns(), []);

  const table = useReactTable({
    data: localFeedbacks,
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
    ...STATUSES.map((s) => ({ value: s, label: s })),
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

      <DataTable table={table} isPending={isPending} emptyMessage="No feedback found." />

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
