import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import Booking from "@/lib/mongodb/models/Booking";
import { parsePageParams, escapeRegex } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BookingsAdminTable } from "@/components/admin/BookingsAdminTable";

export const metadata = {
  title: "Manage Bookings - Midwave Productions",
};

export default async function AdminBookingsPage({ searchParams }) {
  const { session, profile } = await getSession();
  if (!session || !profile?.roles?.includes("admin")) redirect("/");

  await dbConnect();

  const params = await searchParams;
  const { page, pageSize, skip, limit, sort } = parsePageParams(params, {
    defaultPageSize: 20,
    allowedSort: ["createdAt", "eventDate", "status"],
    defaultSort: "createdAt",
  });

  const status = params.status || "all";
  const eventType = params.eventType || "all";
  const filter = {
    ...(status !== "all" && status && { status }),
    ...(eventType !== "all" && eventType && { eventType }),
  };

  const [bookings, totalCount, statusCountsRaw] = await Promise.all([
    Booking.find(filter)
      .populate("artistId", "stageName slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
    Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = {
    all: await Booking.countDocuments(),
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  };

  statusCountsRaw.forEach(({ _id, count }) => {
    if (_id && statusCounts.hasOwnProperty(_id)) {
      statusCounts[_id] = count;
    }
  });

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="3" />
        <SectionHeading className="!text-3xl">Bookings</SectionHeading>
      </div>

      <BookingsAdminTable
        bookings={bookings}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        statusCounts={statusCounts}
      />
    </div>
  );
}
