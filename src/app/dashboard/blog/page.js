import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import BlogPost from "@/lib/mongodb/models/BlogPost";
import { parsePageParams, escapeRegex, serializeDocs } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogAdminTable } from "@/components/admin/BlogAdminTable";

export const metadata = {
  title: "Manage Blog - Midwave Productions",
};

export default async function DashboardBlogPage({ searchParams }) {
  const { session, profile } = await getSession();

  if (!session || !profile?.roles?.includes("admin")) {
    redirect("/");
  }

  await dbConnect();

  const params = await searchParams;
  const { page, pageSize, skip, limit, sort } = parsePageParams(params, {
    defaultPageSize: 20,
    allowedSort: ["createdAt", "publishedAt", "title"],
    defaultSort: "createdAt",
  });

  const searchTerm = params.q || "";
  const regex = searchTerm ? new RegExp(escapeRegex(searchTerm), "i") : null;
  const filter = regex
    ? {
        $or: [{ title: regex }, { excerpt: regex }],
      }
    : {};

  const [posts, totalCount] = await Promise.all([
    BlogPost.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    BlogPost.countDocuments(filter),
  ]);

  const serialized = serializeDocs(posts);

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="13" />
        <SectionHeading className="!text-3xl">Blog</SectionHeading>
      </div>
      <BlogAdminTable
        posts={serialized}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </div>
  );
}
