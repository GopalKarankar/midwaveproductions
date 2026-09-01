import { notFound } from "next/navigation";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/connect";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/seo/buildMetadata";

async function getPublicAsset(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await dbConnect();
  const asset = await MediaAsset.findById(id)
    .select("-uploadedBy -__v")
    .populate("artistId", "stageName slug isPublished")
    .lean();
  if (!asset) return null;
  if (asset.artistId && !asset.artistId.isPublished) return null;
  return asset;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const asset = await getPublicAsset(id);
  if (!asset) return {};
  const title = asset.label || asset.filename || "Media";
  return buildMetadata({
    title: `${title} — Midwave Productions`,
    description: asset.artistId?.stageName
      ? `${title} by ${asset.artistId.stageName} — Midwave Productions`
      : `${title} — Midwave Productions`,
    path: `/media/${id}`,
    image: asset.type === "image" || asset.type === "video" ? asset.url : undefined,
  });
}

export default async function MediaDetailPage({ params }) {
  const { id } = await params;
  const asset = await getPublicAsset(id);
  if (!asset) notFound();

  const title = asset.label || asset.filename || "Untitled";

  return (
    <main className="flex flex-1 flex-col">
      <section className="px-6 md:px-12 pt-24 pb-12">
        <h1 className="font-display text-4xl md:text-6xl uppercase tracking-display text-highlight leading-none mb-2">
          {title}
        </h1>
        {asset.artistId?.slug && (
          <ArrowLink href={`/artists/${asset.artistId.slug}`} color="blue">
            {asset.artistId.stageName}
          </ArrowLink>
        )}
      </section>

      <section className="px-6 md:px-12 pb-16 flex items-center justify-center">
        {asset.type === "image" ? (
          <img src={asset.url} alt={title} className="max-w-full max-h-[80vh] object-contain" />
        ) : asset.type === "video" ? (
          <video src={asset.url} controls playsInline className="max-w-full max-h-[80vh] object-contain" />
        ) : asset.type === "audio" ? (
          <audio src={asset.url} controls className="w-full max-w-md" />
        ) : (
          <ArrowLink href={asset.url} color="blue" direction="↓">DOWNLOAD FILE</ArrowLink>
        )}
      </section>

      <Footer />
    </main>
  );
}
