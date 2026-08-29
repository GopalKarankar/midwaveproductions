"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useReactTable, getCoreRowModel, getExpandedRowModel, createColumnHelper } from "@tanstack/react-table";
import { useTableQueryState } from "@/hooks/useTableQueryState";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { Badge } from "@/components/ui/Badge";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { SelectField } from "@/components/ui/SelectField";

const STATUSES = ["pending", "reviewing", "approved", "rejected", "cancelled"];

const STATUS_COLORS = {
  pending: "text-accent",
  reviewing: "text-accent-2",
  approved: "text-success",
  rejected: "text-error",
  cancelled: "text-muted",
};

const columnHelper = createColumnHelper();

function createBookingColumns() {
  return [
    columnHelper.accessor("requesterName", {
      id: "requesterName",
      header: "Requester",
      cell: (info) => <span className="font-body text-highlight">{info.getValue()}</span>,
    }),
    columnHelper.accessor("artistId.stageName", {
      id: "artistName",
      header: "Artist",
      cell: (info) => <span className="font-body text-muted">{info.getValue()}</span>,
    }),
    columnHelper.accessor("eventType", {
      id: "eventType",
      header: "Event Type",
      cell: (info) => <span className="font-body text-muted text-xs capitalize">{info.getValue()}</span>,
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
        const bookingId = info.row.original._id;
        const { notesDraft, onNotesChange, onNotesSave, savingNotesId } = info.table.options.meta;
        const value = notesDraft[bookingId] || "";
        const isSaving = savingNotesId === bookingId;

        return (
          <textarea
            value={value}
            onChange={(e) => onNotesChange(bookingId, e.target.value)}
            onBlur={() => onNotesSave(bookingId)}
            disabled={isSaving}
            maxLength={2000}
            rows={2}
            placeholder="Internal notes..."
            className="bg-transparent border-0 border-b border-border text-text font-body py-1 text-xs focus:outline-none focus:border-accent transition-colors duration-200 placeholder:text-muted w-full resize-none disabled:opacity-50"
          />
        );
      },
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: "Status",
      cell: (info) => {
        const bookingId = info.row.original._id;
        const currentStatus = info.getValue();
        const { updatingId, onStatusChange } = info.table.options.meta;
        const isUpdating = updatingId === bookingId;

        return (
          <div className="flex items-center gap-2">
            <select
              value={currentStatus}
              onChange={(e) => onStatusChange(bookingId, e.target.value)}
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
    columnHelper.accessor("eventDate", {
      id: "eventDate",
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
  ];
}

const EVENT_TYPES = ["concert", "festival", "private_event", "corporate", "collaboration", "other"];

export function BookingsAdminTable({ bookings, page, pageSize, totalCount, statusCounts }) {
  const [localBookings, setLocalBookings] = useState(bookings);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notesDraft, setNotesDraft] = useState({});
  const [savingNotesId, setSavingNotesId] = useState(null);
  const { status, setParams, isPending } = useTableQueryState();
  const searchParams = useSearchParams();
  const eventType = searchParams.get('eventType') || 'all';

  // Resync when prop data changes
  useEffect(() => {
    setLocalBookings(bookings);
    setNotesDraft(bookings.reduce((acc, b) => {
      acc[b._id] = b.adminNotes || "";
      return acc;
    }, {}));
  }, [bookings]);

  const activeTab = status === "all" ? "all" : status;

  const updateStatus = async (bookingId, newStatus) => {
    const currentBooking = localBookings.find((b) => b._id === bookingId);
    if (currentBooking.status === newStatus) return;

    setUpdatingId(bookingId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to update");
        return;
      }

      const { booking } = await response.json();
      setLocalBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? booking : b))
      );
    } catch (err) {
      console.error("Error updating booking:", err);
      setErrorMessage("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveAdminNotes = async (bookingId) => {
    const currentNotes = notesDraft[bookingId] || "";
    const currentBooking = localBookings.find((b) => b._id === bookingId);
    const savedNotes = currentBooking.adminNotes || "";

    if (currentNotes === savedNotes) return;

    setSavingNotesId(bookingId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: currentNotes }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to update notes");
        return;
      }

      const { booking } = await response.json();
      setLocalBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? booking : b))
      );
      setNotesDraft((prev) => ({
        ...prev,
        [bookingId]: booking.adminNotes || "",
      }));
    } catch (err) {
      console.error("Error updating notes:", err);
      setErrorMessage("Failed to update notes");
    } finally {
      setSavingNotesId(null);
    }
  };

  const columns = useMemo(() => createBookingColumns(), []);

  const table = useReactTable({
    data: localBookings,
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
    getExpandedRowModel: getExpandedRowModel(),
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

  const eventTypeOptions = [
    { value: 'all', label: 'All' },
    ...EVENT_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, ' ').toUpperCase() })),
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
          id="eventtype-filter"
          label="Filter by Event Type"
          options={eventTypeOptions}
          value={eventType}
          onChange={(e) => setParams({ eventType: e.target.value })}
        />
      </div>

      {errorMessage && (
        <p className="font-mono text-xs text-error tracking-widest uppercase">
          {errorMessage}
        </p>
      )}

      <DataTable table={table} isPending={isPending} emptyMessage="No bookings found." />

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
