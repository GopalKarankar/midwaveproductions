import dbConnect from "@/lib/mongodb/connect";
import Booking from "@/lib/mongodb/models/Booking";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BookingsAdminTable } from "@/components/admin/BookingsAdminTable";

export const metadata = {
  title: "Manage Bookings - Midwave Productions",
};

export default async function AdminBookingsPage() {
  await dbConnect();
  const bookings = await Booking.find()
    .populate("artistId", "stageName slug")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="3" />
        <SectionHeading className="!text-3xl">Bookings</SectionHeading>
      </div>

      <BookingsAdminTable bookings={bookings} />
    </div>
  );
}
