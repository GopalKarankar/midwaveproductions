import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import Brand from "@/lib/mongodb/models/Brand";
import { parsePageParams, escapeRegex, serializeDocs } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrandsAdminTable } from "@/components/admin/BrandsAdminTable";

export const metadata = {
  title: "Promote Brands - Midwave Productions",
};

export default async function DashboardBrandsPage({ searchParams }) {
  const { session, profile } = await getSession();

  if (!session || !profile?.roles?.includes("admin")) {
    redirect("/");
  }

  await dbConnect();

  const params = await searchParams;
  const { page, pageSize, skip, limit, sort } = parsePageParams(params, {
    defaultPageSize: 20,
    allowedSort: ["createdAt", "name"],
    defaultSort: "createdAt",
  });

  const searchTerm = params.q || "";
  const regex = searchTerm ? new RegExp(escapeRegex(searchTerm), "i") : null;
  const status = params.status || 'all';
  const featured = params.featured || 'all';

  const filter = {
    ...(regex && { name: regex }),
    ...(status === 'active' && { isActive: true }),
    ...(status === 'inactive' && { isActive: false }),
    ...(featured === 'yes' && { isFeatured: true }),
    ...(featured === 'no' && { isFeatured: false }),
  };

  const [brands, totalCount] = await Promise.all([
    Brand.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Brand.countDocuments(filter),
  ]);

  const serialized = serializeDocs(brands);

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="14" />
        <SectionHeading className="!text-3xl">Promote Brands</SectionHeading>
      </div>
      <BrandsAdminTable
        brands={serialized}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </div>
  );
}
