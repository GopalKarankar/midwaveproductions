import dbConnect from "@/lib/mongodb/connect";
import { getSession } from "@/lib/auth/getSession";
import Artist from "@/lib/mongodb/models/Artist";
import Booking from "@/lib/mongodb/models/Booking";
import { DashboardArtistPanel } from "@/components/dashboard/DashboardArtistPanel";
import { DashboardManagerPanel } from "@/components/dashboard/DashboardManagerPanel";
import { DashboardUserPanel } from "@/components/dashboard/DashboardUserPanel";

export const metadata = {
  title: "Dashboard - Midwave Productions",
};

export default async function DashboardPage() {
  const { session, profile } = await getSession();

  if (!session) {
    return null;
  }

  const userRole = profile?.role || "user";

  if (userRole === "artist") {
    await dbConnect();
    const artist = await Artist.findOne({ ownerId: session.user.id }).lean();
    return <DashboardArtistPanel artist={artist} userId={session.user.id} />;
  }

  if (userRole === "manager") {
    await dbConnect();
    const artists = await Artist.find({ managedBy: session.user.id }).lean();
    const bookings = await Booking.find({
      artistId: { $in: artists.map((a) => a._id) },
    })
      .populate("artistId", "stageName slug")
      .lean();

    return <DashboardManagerPanel artists={artists} bookings={bookings} />;
  }

  return <DashboardUserPanel />;
}
