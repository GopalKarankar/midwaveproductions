"use client";

import { useState } from "react";

const STATUSES = ["pending", "reviewing", "approved", "rejected", "cancelled"];

const STATUS_COLORS = {
  pending: "text-accent",
  reviewing: "text-accent-2",
  approved: "text-success",
  rejected: "text-error",
  cancelled: "text-muted",
};

export function BookingsAdminTable({ bookings }) {
  const [localBookings, setLocalBookings] = useState(bookings);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (bookingId, newStatus) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update");

      const { booking } = await response.json();
      setLocalBookings((prev) =>
        prev.map((b) => (b._id.toString() === bookingId ? booking : b))
      );
    } catch (err) {
      console.error("Error updating booking:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface">
          <tr>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
              Requester
            </th>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
              Artist
            </th>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
              Event Type
            </th>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
              Status
            </th>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {localBookings.map((booking) => (
            <tr key={booking._id} className="border-t border-border hover:bg-surface-2 transition-colors">
              <td className="px-4 py-3 font-body text-highlight">{booking.requesterName}</td>
              <td className="px-4 py-3 font-body text-muted">{booking.artistId?.stageName}</td>
              <td className="px-4 py-3 font-body text-muted text-xs capitalize">{booking.eventType}</td>
              <td className="px-4 py-3">
                <select
                  value={booking.status}
                  onChange={(e) => updateStatus(booking._id.toString(), e.target.value)}
                  disabled={isLoading}
                  className={`bg-transparent border border-border px-2 py-1 text-xs font-mono uppercase tracking-widest rounded cursor-pointer ${
                    STATUS_COLORS[booking.status]
                  }`}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 font-body text-muted text-xs">
                {booking.eventDate
                  ? new Date(booking.eventDate).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
