import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { hasRole } from "@/constants/roles";
import dbConnect from "@/lib/mongodb/connect";
import Artist from "@/lib/mongodb/models/Artist";
import { parsePageParams, escapeRegex } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArtistPortfolioTable } from "@/components/admin/ArtistPortfolioTable";

export const metadata = {
  title: "Artist Portfolio - Midwave Productions",
};

export default async function ArtistPortfolioPage({ searchParams }) {
  const { session, profile } = await getSession();

  if (!session || !hasRole(profile?.roles, "manager")) {
    redirect("/");
  }

  await dbConnect();
  const isAdmin = hasRole(profile?.roles, "admin");

  const params = await searchParams;
  const { page, pageSize, skip, limit, sort } = parsePageParams(params, {
    defaultPageSize: 20,
    allowedSort: ["stageName", "createdAt", "isPublished"],
    defaultSort: "createdAt",
  });

  const searchTerm = params.q || "";
  const regex = searchTerm ? new RegExp(escapeRegex(searchTerm), "i") : null;
  const status = params.status || "all";

  const filter = {
    ...(isAdmin ? {} : { managedBy: session.user.id }),
    ...(regex && { $or: [{ stageName: regex }, { slug: regex }] }),
    ...(status === "published" && { isPublished: true }),
    ...(status === "draft" && { isPublished: false }),
  };

  const [artists, totalCount] = await Promise.all([
    Artist.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Artist.countDocuments(filter),
  ]);

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="2" />
        <SectionHeading className="!text-3xl">Artist Portfolio</SectionHeading>
      </div>
      <ArtistPortfolioTable
        artists={JSON.parse(JSON.stringify(artists))}
        isAdmin={isAdmin}
        currentUserId={session.user.id}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </div>
  );
}
