import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import StudioReservation from "@/lib/mongodb/models/StudioReservation";
import { parsePageParams } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StudioReservationsAdminTable } from "@/components/admin/StudioReservationsAdminTable";

export const metadata = {
  title: "Reserve Studio - Midwave Productions",
};

export default async function DashboardReserveStudioPage({ searchParams }) {
  const { session, profile } = await getSession();

  if (!session || !profile?.roles?.includes("admin")) {
    redirect("/");
  }

  await dbConnect();

  const params = await searchParams;
  const { page, pageSize, skip, limit, sort } = parsePageParams(params, {
    defaultPageSize: 20,
    allowedSort: ["createdAt", "preferredDate", "status"],
    defaultSort: "createdAt",
  });

  const status = params.status || "all";
  const purpose = params.purpose || "all";
  const filter = {
    ...(status !== "all" && status && { status }),
    ...(purpose !== "all" && purpose && { purpose }),
  };

  const [reservations, totalCount, statusCountsRaw] = await Promise.all([
    StudioReservation.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    StudioReservation.countDocuments(filter),
    StudioReservation.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = {
    all: await StudioReservation.countDocuments(),
    pending: 0,
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
        <SectionNumber n="15" />
        <SectionHeading className="!text-3xl">Reserve Studio</SectionHeading>
      </div>

      <StudioReservationsAdminTable
        reservations={reservations}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        statusCounts={statusCounts}
      />
    </div>
  );
}
