import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedArtistsSection } from "@/components/sections/FeaturedArtistsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { MarqueeTicker } from "@/components/layout/MarqueeTicker";
import { BrandsSection } from "@/components/sections/BrandsSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import Artist from "@/lib/mongodb/models/Artist";
import Brand from "@/lib/mongodb/models/Brand";
import Booking from "@/lib/mongodb/models/Booking";

async function getFeaturedArtists() {
  await dbConnect();
  const featured = await Artist.find({ isPublished: true, isFeatured: true })
    .select("stageName slug genres profileImage shortBio")
    .sort({ stageName: 1 })
    .lean();

  if (featured.length > 0) return featured;

  return await Artist.find({ isPublished: true })
    .select("stageName slug genres profileImage shortBio")
    .sort({ stageName: 1 })
    .lean();
}

async function getFeaturedBrands() {
  await dbConnect();
  const featured = await Brand.find({ isActive: true, isFeatured: true })
    .select("name logoUrl websiteUrl")
    .sort({ name: 1 })
    .lean();

  if (featured.length > 0) return featured;

  return await Brand.find({ isActive: true })
    .select("name logoUrl websiteUrl")
    .sort({ name: 1 })
    .lean();
}

async function getStats() {
  await dbConnect();
  const artistCount = await Artist.countDocuments({ isPublished: true });
  const bookingCount = await Booking.countDocuments({ status: "approved" });

  return [
    { label: "ARTISTS MANAGED", value: artistCount, suffix: "" },
    { label: "EVENTS BOOKED", value: bookingCount, suffix: "" },
    { label: "YEARS IN INDUSTRY", value: 6, suffix: "" },
  ];
}

function getMarqueeData(artists) {
  const artistNames = artists.slice(0, 10).map((a) => a.stageName);
  const genresSet = new Set();
  artists.forEach((a) => {
    (a.genres || []).forEach((g) => genresSet.add(g));
  });
  const tags = Array.from(genresSet).slice(0, 8);
  return { artistNames, tags };
}

export default async function Home() {
  const { session } = await getSession();
  const [artists, brands, stats] = await Promise.all([
    getFeaturedArtists(),
    getFeaturedBrands(),
    getStats(),
  ]);

  const { artistNames, tags } = getMarqueeData(artists);

  return (
    <main className="flex flex-1 flex-col">
      <HeroSection isAuthenticated={!!session} />
      <FeaturedArtistsSection artists={artists} />
      <ServicesSection />
      <StatsSection stats={stats} />
      <MarqueeTicker artistNames={artistNames} tags={tags} />
      <BrandsSection brands={brands} />
      <CTASection />
      <Footer />
    </main>
  );
}
