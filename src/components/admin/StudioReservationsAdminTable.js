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

const STATUSES = ["pending", "approved", "rejected", "cancelled"];
const PURPOSES = ["recording", "mixing", "mastering", "rehearsal", "podcast", "other"];

const STATUS_COLORS = {
  pending: "text-accent",
  approved: "text-success",
  rejected: "text-error",
  cancelled: "text-muted",
};

const columnHelper = createColumnHelper();

function createReservationColumns() {
  return [
    columnHelper.accessor("requesterName", {
      id: "requesterName",
      header: "Requester",
      cell: (info) => <span className="font-body text-highlight">{info.getValue()}</span>,
    }),
    columnHelper.accessor("requesterEmail", {
      id: "requesterEmail",
      header: "Email",
      cell: (info) => <span className="font-body text-muted text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor("purpose", {
      id: "purpose",
      header: "Purpose",
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
        const reservationId = info.row.original._id;
        const { notesDraft, onNotesChange, onNotesSave, savingNotesId } = info.table.options.meta;
        const value = notesDraft[reservationId] || "";
        const isSaving = savingNotesId === reservationId;

        return (
          <textarea
            value={value}
            onChange={(e) => onNotesChange(reservationId, e.target.value)}
            onBlur={() => onNotesSave(reservationId)}
            disabled={isSaving}
            maxLength={2000}
            rows={2}
            placeholder="Internal notes..."
            className="bg-transparent border-0 border-b border-border text-text font-body py-1 text-xs focus:outline-none focus:border-accent transition-colors duration-200 placeholder:text-muted w-full resize-none disabled:opacity-50"
          />
        );
      },
    }),
    columnHelper.accessor("preferredDate", {
      id: "preferredDate",
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
    columnHelper.accessor("startTime", {
      id: "startTime",
      header: "Time",
      cell: (info) => <span className="font-body text-muted text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor("durationHours", {
      id: "duration",
      header: "Duration",
      cell: (info) => <span className="font-body text-muted text-xs">{info.getValue()}h</span>,
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: "Status",
      cell: (info) => {
        const reservationId = info.row.original._id;
        const currentStatus = info.getValue();
        const { updatingId, onStatusChange } = info.table.options.meta;
        const isUpdating = updatingId === reservationId;

        return (
          <div className="flex items-center gap-2">
            <select
              value={currentStatus}
              onChange={(e) => onStatusChange(reservationId, e.target.value)}
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

export function StudioReservationsAdminTable({
  reservations,
  page,
  pageSize,
  totalCount,
  statusCounts,
}) {
  const [localReservations, setLocalReservations] = useState(reservations);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notesDraft, setNotesDraft] = useState({});
  const [savingNotesId, setSavingNotesId] = useState(null);
  const { status, setParams, isPending } = useTableQueryState();
  const searchParams = useSearchParams();
  const purpose = searchParams.get('purpose') || 'all';

  useEffect(() => {
    setLocalReservations(reservations);
    setNotesDraft(reservations.reduce((acc, r) => {
      acc[r._id] = r.adminNotes || "";
      return acc;
    }, {}));
  }, [reservations]);

  const activeTab = status === "all" ? "all" : status;

  const updateStatus = async (reservationId, newStatus) => {
    const currentReservation = localReservations.find((r) => r._id === reservationId);
    if (currentReservation.status === newStatus) return;

    setUpdatingId(reservationId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/reserve-studio/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to update");
        return;
      }

      const { reservation } = await response.json();
      setLocalReservations((prev) =>
        prev.map((r) => (r._id === reservationId ? reservation : r))
      );
    } catch (err) {
      console.error("Error updating reservation:", err);
      setErrorMessage("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveAdminNotes = async (reservationId) => {
    const currentNotes = notesDraft[reservationId] || "";
    const currentReservation = localReservations.find((r) => r._id === reservationId);
    const savedNotes = currentReservation.adminNotes || "";

    if (currentNotes === savedNotes) return;

    setSavingNotesId(reservationId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/reserve-studio/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: currentNotes }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to update notes");
        return;
      }

      const { reservation } = await response.json();
      setLocalReservations((prev) =>
        prev.map((r) => (r._id === reservationId ? reservation : r))
      );
      setNotesDraft((prev) => ({
        ...prev,
        [reservationId]: reservation.adminNotes || "",
      }));
    } catch (err) {
      console.error("Error updating notes:", err);
      setErrorMessage("Failed to update notes");
    } finally {
      setSavingNotesId(null);
    }
  };

  const columns = useMemo(() => createReservationColumns(), []);

  const table = useReactTable({
    data: localReservations,
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

  const purposeOptions = [
    { value: 'all', label: 'All' },
    ...PURPOSES.map((p) => ({ value: p, label: p.replace(/_/g, ' ').toUpperCase() })),
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
          id="purpose-filter"
          label="Filter by Purpose"
          options={purposeOptions}
          value={purpose}
          onChange={(e) => setParams({ purpose: e.target.value })}
        />
      </div>

      {errorMessage && (
        <p className="font-mono text-xs text-error tracking-widest uppercase">
          {errorMessage}
        </p>
      )}

      <DataTable table={table} isPending={isPending} emptyMessage="No reservations found." />

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
