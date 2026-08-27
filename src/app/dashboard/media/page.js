import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import Artist from "@/lib/mongodb/models/Artist";
import { parsePageParams, escapeRegex } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaAdminBrowser } from "@/components/admin/MediaAdminBrowser";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";

export const metadata = {
  title: "Manage Media - Midwave Productions",
};

export default async function AdminMediaPage({ searchParams }) {
  const { session, profile } = await getSession();
  if (!session || !profile?.roles?.includes("admin")) redirect("/");

  await dbConnect();

  const params = await searchParams;
  const { page, pageSize, skip, limit, sort } = parsePageParams(params, {
    defaultPageSize: 20,
    allowedSort: ["createdAt", "filename", "size"],
    defaultSort: "createdAt",
  });

  const type = params.type || "all";
  const searchTerm = params.q || "";
  const regex = searchTerm ? new RegExp(escapeRegex(searchTerm), "i") : null;

  const filter = {
    ...(type !== "all" && { type }),
    ...(regex && { filename: regex }),
  };

  const [assets, totalCount, artists] = await Promise.all([
    MediaAsset.find(filter)
      .populate("artistId", "stageName slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    MediaAsset.countDocuments(filter),
    Artist.find()
      .select("stageName slug")
      .sort({ stageName: 1 })
      .lean(),
  ]);

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="5" />
        <SectionHeading className="!text-3xl">Media Storage</SectionHeading>
      </div>

      <MediaUploadForm artists={artists} />
      <MediaAdminBrowser assets={assets} page={page} pageSize={pageSize} totalCount={totalCount} />
    </div>
  );
}
