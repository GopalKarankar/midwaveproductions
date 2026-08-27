import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function DashboardManagerPanel({ artists, bookings, sectionNumber = "1" }) {
  const bookingsByStatus = {
    pending: bookings.filter((b) => b.status === "pending"),
    reviewing: bookings.filter((b) => b.status === "reviewing"),
    approved: bookings.filter((b) => b.status === "approved"),
    rejected: bookings.filter((b) => b.status === "rejected"),
  };

  return (
    <div className="px-8 py-12 max-w-4xl">
      <div className="flex items-center gap-3 mb-12">
        <SectionNumber n={sectionNumber} />
        <SectionHeading className="!text-3xl">Your Roster</SectionHeading>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-display uppercase tracking-display text-accent-2 mb-6">
          Artists You Manage
        </h2>
        {artists.length === 0 ? (
          <p className="font-body text-muted">No artists yet.</p>
        ) : (
          <div className="flex flex-col gap-2 border-b border-border pb-6">
            {artists.map((artist) => (
              <div
                key={artist._id}
                className="flex justify-between items-center py-3 border-t border-border"
              >
                <span className="font-body text-highlight">{artist.stageName}</span>
                <span className="text-xs font-mono text-muted">
                  {artist.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-display uppercase tracking-display text-accent-2 mb-6">
          Booking Requests
        </h2>
        <div className="flex gap-4 mb-8">
          {Object.entries(bookingsByStatus).map(([status, items]) => (
            <div key={status} className="flex-1">
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">
                {status} ({items.length})
              </div>
              <div className="h-8 bg-surface border border-border rounded flex items-center justify-center">
                <span className="text-sm font-display text-highlight">{items.length}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-b border-border pb-6">
          {bookings.length === 0 ? (
            <p className="font-body text-muted">No bookings yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex justify-between items-center py-3 border-t border-border"
                >
                  <div>
                    <p className="font-body text-highlight">{booking.requesterName}</p>
                    <p className="text-xs font-mono text-muted">{booking.artistId?.stageName}</p>
                  </div>
                  <span
                    className={`text-xs font-mono uppercase tracking-widest ${
                      booking.status === "approved"
                        ? "text-success"
                        : booking.status === "rejected"
                          ? "text-error"
                          : "text-accent"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
