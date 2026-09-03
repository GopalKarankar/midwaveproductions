import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import ProblemReport from "@/lib/mongodb/models/ProblemReport";
import { parsePageParams } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProblemReportsAdminTable } from "@/components/admin/ProblemReportsAdminTable";

export const metadata = {
  title: "Problem Reports - Midwave Productions",
};

export default async function DashboardProblemReportsPage({ searchParams }) {
  const { session, profile } = await getSession();

  if (!session || !profile?.roles?.includes("admin")) {
    redirect("/");
  }

  await dbConnect();

  const params = await searchParams;
  const { page, pageSize, skip, limit, sort } = parsePageParams(params, {
    defaultPageSize: 20,
    allowedSort: ["createdAt", "status", "severity"],
    defaultSort: "createdAt",
  });

  const status = params.status || "all";
  const category = params.category || "all";
  const filter = {
    ...(status !== "all" && status && { status }),
    ...(category !== "all" && category && { category }),
  };

  const [reports, totalCount, statusCountsRaw] = await Promise.all([
    ProblemReport.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    ProblemReport.countDocuments(filter),
    ProblemReport.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = {
    all: await ProblemReport.countDocuments(),
    open: 0,
    investigating: 0,
    resolved: 0,
    wont_fix: 0,
  };

  statusCountsRaw.forEach(({ _id, count }) => {
    if (_id && statusCounts.hasOwnProperty(_id)) {
      statusCounts[_id] = count;
    }
  });

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="20" />
        <SectionHeading className="!text-3xl">Problem Reports</SectionHeading>
      </div>

      <ProblemReportsAdminTable
        reports={reports}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        statusCounts={statusCounts}
      />
    </div>
  );
}
