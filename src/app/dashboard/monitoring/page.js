import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import ApiRequestLog from "@/lib/mongodb/models/ApiRequestLog";
import { parsePageParams, escapeRegex, serializeDocs } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MonitoringLogsTable } from "@/components/admin/MonitoringLogsTable";

export const metadata = {
  title: "API Requests - Midwave Productions",
};

export default async function MonitoringPage({ searchParams }) {
  const { session, profile } = await getSession();
  if (!session || !profile?.roles?.includes("admin")) redirect("/");

  await dbConnect();

  const params = await searchParams;
  const { page, pageSize, skip, limit, sort, sortField, sortDir } = parsePageParams(params, {
    defaultPageSize: 20,
    allowedSort: ["createdAt", "statusCode"],
    defaultSort: "createdAt",
  });

  const searchTerm = params.q || "";
  const regex = searchTerm ? new RegExp(escapeRegex(searchTerm), "i") : null;
  const filter = regex
    ? {
        $or: [{ ip: regex }, { path: regex }],
      }
    : {};

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [recentLogs, totalCount, totalToday, errorAgg, topEndpoints, rateLimitBlocksToday] = await Promise.all([
    ApiRequestLog.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    ApiRequestLog.countDocuments(filter),
    ApiRequestLog.countDocuments({ createdAt: { $gte: startOfToday } }),
    ApiRequestLog.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          errors: { $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } },
        },
      },
    ]),
    ApiRequestLog.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: { method: "$method", routeKey: "$routeKey" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    ApiRequestLog.countDocuments({ createdAt: { $gte: startOfToday }, rateLimited: true }),
  ]);

  const errorRate = errorAgg[0]?.total ? Math.round((errorAgg[0].errors / errorAgg[0].total) * 100) : 0;

  const logs = serializeDocs(recentLogs);

  const stats = [
    { label: "Requests Today", value: totalToday },
    { label: "Error Rate", value: `${errorRate}%`, highlight: errorRate > 10 },
    { label: "Rate-Limit Blocks", value: rateLimitBlocksToday, highlight: rateLimitBlocksToday > 0 },
    {
      label: "Top Endpoint",
      value: topEndpoints[0] ? `${topEndpoints[0]._id.method} ${topEndpoints[0]._id.routeKey}` : "—",
    },
  ];

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-12">
        <SectionNumber n="8" />
        <SectionHeading className="!text-3xl">API Requests</SectionHeading>
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
            <p
              className={`text-3xl font-display tracking-display ${
                highlight ? "text-accent-2" : "text-highlight"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {topEndpoints.length > 0 && (
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-lg uppercase tracking-display text-accent-2 mb-4">
            Top Endpoints
          </h2>
          <div className="flex flex-col gap-3">
            {topEndpoints.map((endpoint) => (
              <div key={`${endpoint._id.method}-${endpoint._id.routeKey}`} className="flex justify-between items-center">
                <span className="text-sm font-mono text-muted">
                  {endpoint._id.method} /{endpoint._id.routeKey}
                </span>
                <span className="font-display text-highlight">{endpoint.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <MonitoringLogsTable logs={logs} page={page} pageSize={pageSize} totalCount={totalCount} sortField={sortField} sortDir={sortDir} />
    </div>
  );
}
