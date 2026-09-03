import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import Feedback from "@/lib/mongodb/models/Feedback";
import { parsePageParams } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeedbackAdminTable } from "@/components/admin/FeedbackAdminTable";

export const metadata = {
  title: "Feedback - Midwave Productions",
};

export default async function DashboardFeedbackPage({ searchParams }) {
  const { session, profile } = await getSession();

  if (!session || !profile?.roles?.includes("admin")) {
    redirect("/");
  }

  await dbConnect();

  const params = await searchParams;
  const { page, pageSize, skip, limit, sort } = parsePageParams(params, {
    defaultPageSize: 20,
    allowedSort: ["createdAt", "status"],
    defaultSort: "createdAt",
  });

  const status = params.status || "all";
  const category = params.category || "all";
  const filter = {
    ...(status !== "all" && status && { status }),
    ...(category !== "all" && category && { category }),
  };

  const [feedbacks, totalCount, statusCountsRaw] = await Promise.all([
    Feedback.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Feedback.countDocuments(filter),
    Feedback.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = {
    all: await Feedback.countDocuments(),
    new: 0,
    reviewed: 0,
    archived: 0,
  };

  statusCountsRaw.forEach(({ _id, count }) => {
    if (_id && statusCounts.hasOwnProperty(_id)) {
      statusCounts[_id] = count;
    }
  });

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="19" />
        <SectionHeading className="!text-3xl">Feedback</SectionHeading>
      </div>

      <FeedbackAdminTable
        feedbacks={feedbacks}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        statusCounts={statusCounts}
      />
    </div>
  );
}
