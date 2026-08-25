"use client";

import { useState, useMemo } from "react";

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
  const [updatingId, setUpdatingId] = useState(null);
  const [errorId, setErrorId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const statusCounts = useMemo(() => {
    const counts = { all: localBookings.length };
    STATUSES.forEach((status) => {
      counts[status] = localBookings.filter((b) => b.status === status).length;
    });
    return counts;
  }, [localBookings]);

  const filteredBookings =
    activeTab === "all"
      ? localBookings
      : localBookings.filter((b) => b.status === activeTab);

  const updateStatus = async (bookingId, newStatus) => {
    const currentBooking = localBookings.find((b) => b._id.toString() === bookingId);
    if (currentBooking.status === newStatus) return;

    setUpdatingId(bookingId);
    setErrorId(null);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorId(bookingId);
        setErrorMessage(data.error || "Failed to update");
        return;
      }

      const { booking } = await response.json();
      setLocalBookings((prev) =>
        prev.map((b) => (b._id.toString() === bookingId ? booking : b))
      );
    } catch (err) {
      console.error("Error updating booking:", err);
      setErrorId(bookingId);
      setErrorMessage("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUSES].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
              activeTab === tab
                ? "text-accent-2 border-b-2 border-accent-2"
                : "text-muted hover:text-highlight border-b-2 border-transparent"
            }`}
          >
            {tab === "all" ? "All" : tab} ({statusCounts[tab]})
          </button>
        ))}
      </div>

      {errorMessage && (
        <p className="font-mono text-xs text-error tracking-widest uppercase">
          {errorMessage}
        </p>
      )}

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
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="border-t border-border hover:bg-surface-2 transition-colors">
                <td className="px-4 py-3 font-body text-highlight">{booking.requesterName}</td>
                <td className="px-4 py-3 font-body text-muted">{booking.artistId?.stageName}</td>
                <td className="px-4 py-3 font-body text-muted text-xs capitalize">{booking.eventType}</td>
                <td className="px-4 py-3">
                  <select
                    value={booking.status}
                    onChange={(e) => updateStatus(booking._id.toString(), e.target.value)}
                    disabled={updatingId === booking._id.toString()}
                    className={`bg-transparent border border-border px-2 py-1 text-xs font-mono uppercase tracking-widest rounded cursor-pointer disabled:opacity-50 ${
                      STATUS_COLORS[booking.status]
                    }`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {updatingId === booking._id.toString() && (
                    <span className="ml-2 text-xs text-muted">Updating...</span>
                  )}
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

      {filteredBookings.length === 0 && (
        <p className="font-body text-muted text-center py-8">No bookings found.</p>
      )}
    </div>
  );
}
