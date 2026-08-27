import dbConnect from "@/lib/mongodb/connect";
import BlogPost from "@/lib/mongodb/models/BlogPost";
import { parsePageParams, serializeDocs } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { BlogListSection } from "@/components/sections/BlogListSection";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Blog - Midwave Productions",
  description: "Stories and updates from Midwave Productions",
};

export default async function BlogPage({ searchParams }) {
  await dbConnect();

  const params = await searchParams;
  const tag = params.tag?.toLowerCase();
  const { page, pageSize, skip, limit } = parsePageParams(params, {
    defaultPageSize: 12,
    allowedSort: [],
    defaultSort: "publishedAt",
  });

  const filter = { isPublished: true };
  if (tag) filter.tags = tag;

  const [posts, totalCount, allTags] = await Promise.all([
    BlogPost.find(filter)
      .select("title slug excerpt coverImage tags publishedAt")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BlogPost.countDocuments(filter),
    BlogPost.distinct("tags", { isPublished: true }),
  ]);

  const serialized = serializeDocs(posts);
  const pageCount = Math.ceil(totalCount / pageSize);

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 md:px-12 pt-16 pb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <SectionNumber n="6" />
            <SectionHeading>Blog</SectionHeading>
          </div>
          <VersionLabel />
        </div>
      </section>

      <BlogListSection
        posts={serialized}
        tags={allTags || []}
        activeTag={tag}
        page={page}
        pageCount={pageCount}
      />

      <Footer />
    </main>
  );
}
