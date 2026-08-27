"use client";

import { useState, useEffect, useMemo } from "react";
import { useReactTable, getCoreRowModel, getExpandedRowModel, createColumnHelper } from "@tanstack/react-table";
import { useTableQueryState } from "@/hooks/useTableQueryState";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { Badge } from "@/components/ui/Badge";

const STATUSES = ["pending", "reviewing", "approved", "rejected", "cancelled"];

const STATUS_COLORS = {
  pending: "text-accent",
  reviewing: "text-accent-2",
  approved: "text-success",
  rejected: "text-error",
  cancelled: "text-muted",
};

const columnHelper = createColumnHelper();

function createBookingColumns({ onStatusChange, updatingId, errorMessage }) {
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
    columnHelper.accessor("status", {
      id: "status",
      header: "Status",
      cell: (info) => {
        const bookingId = info.row.original._id;
        const currentStatus = info.getValue();
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

export function BookingsAdminTable({ bookings, page, pageSize, totalCount, statusCounts }) {
  const [localBookings, setLocalBookings] = useState(bookings);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { status, setParams, isPending } = useTableQueryState();

  // Resync when prop data changes
  useEffect(() => {
    setLocalBookings(bookings);
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

  const columns = useMemo(
    () => createBookingColumns({ onStatusChange: updateStatus, updatingId, errorMessage }),
    [updatingId, errorMessage]
  );

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
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUSES].map((tab) => (
          <button
            key={tab}
            onClick={() => setParams({ status: tab === "all" ? "all" : tab })}
            className={`px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
              activeTab === tab
                ? "text-accent-2 border-b-2 border-accent-2"
                : "text-muted hover:text-highlight border-b-2 border-transparent"
            }`}
          >
            {tab === "all" ? "All" : tab} ({statusCounts[tab] || 0})
          </button>
        ))}
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
