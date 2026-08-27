import dbConnect from "@/lib/mongodb/connect";
import { getSession } from "@/lib/auth/getSession";
import Artist from "@/lib/mongodb/models/Artist";
import Booking from "@/lib/mongodb/models/Booking";
import User from "@/lib/mongodb/models/User";
import { DashboardArtistPanel } from "@/components/dashboard/DashboardArtistPanel";
import { DashboardManagerPanel } from "@/components/dashboard/DashboardManagerPanel";
import { DashboardUserPanel } from "@/components/dashboard/DashboardUserPanel";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Dashboard - Midwave Productions",
};

export default async function DashboardPage() {
  const { session, profile } = await getSession();

  if (!session) {
    return null;
  }

  const roles = profile?.roles?.length ? profile.roles : ["user"];

  if (roles.includes("admin")) {
    await dbConnect();

    const [artistCount, bookingCount, userCount, bookingsByStatus] = await Promise.all([
      Artist.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments(),
      Booking.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statusCounts = {
      pending: 0,
      reviewing: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };

    bookingsByStatus.forEach(({ _id, count }) => {
      if (_id in statusCounts) {
        statusCounts[_id] = count;
      }
    });

    const stats = [
      { label: "Total Artists", value: artistCount },
      { label: "Total Bookings", value: bookingCount },
      { label: "Total Users", value: userCount },
      { label: "Pending Bookings", value: statusCounts.pending, highlight: true },
    ];

    return (
      <div className="px-8 py-12">
        <div className="flex items-center gap-3 mb-12">
          <SectionNumber n="1" />
          <SectionHeading className="!text-3xl">Overview</SectionHeading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`border ${highlight ? "border-accent-2 bg-surface-2" : "border-border"} p-6`}
            >
              <p className="text-xs font-mono text-muted tracking-widest uppercase mb-3">
                {label}
              </p>
              <p className={`text-3xl font-display tracking-display ${highlight ? "text-accent-2" : "text-highlight"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-border p-6">
            <h2 className="font-display text-lg uppercase tracking-display text-accent-2 mb-4">
              Booking Status
            </h2>
            <div className="flex flex-col gap-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm font-body text-muted capitalize">{status}</span>
                  <span className="font-display text-highlight">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border p-6">
            <h2 className="font-display text-lg uppercase tracking-display text-accent-2 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              <a href="/dashboard/artists" className="text-accent hover:text-accent-hover transition-colors">
                Manage Artists →
              </a>
              <a href="/dashboard/bookings" className="text-accent hover:text-accent-hover transition-colors">
                Review Bookings →
              </a>
              <a href="/dashboard/users" className="text-accent hover:text-accent-hover transition-colors">
                Manage Users →
              </a>
              <a href="/dashboard/media" className="text-accent hover:text-accent-hover transition-colors">
                Browse Media →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (roles.includes("artist") || roles.includes("manager")) {
    await dbConnect();
    const panels = [];

    if (roles.includes("artist")) {
      const artist = await Artist.findOne({ ownerId: session.user.id }).lean();
      panels.push(
        <DashboardArtistPanel key="artist" sectionNumber="1" artist={artist} userId={session.user.id} />
      );
    }

    if (roles.includes("manager")) {
      const artists = await Artist.find({ managedBy: session.user.id }).lean();
      const bookings = await Booking.find({
        artistId: { $in: artists.map((a) => a._id) },
      })
        .populate("artistId", "stageName slug")
        .lean();

      panels.push(
        <DashboardManagerPanel
          key="manager"
          sectionNumber={roles.includes("artist") ? "2" : "1"}
          artists={artists}
          bookings={bookings}
        />
      );
    }

    return <div className="flex flex-col">{panels}</div>;
  }

  return <DashboardUserPanel />;
}
