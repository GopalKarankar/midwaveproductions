import dbConnect from "@/lib/mongodb/connect";
import PricingTier from "@/lib/mongodb/models/PricingTier";
import { pricingTiers as fallbackTiers } from "@/lib/data/placeholderPricing";
import { PricingContent } from "@/components/sections/PricingContent";

export const metadata = {
  title: "Pricing - Midwave Productions",
};

export default async function PricingPage() {
  await dbConnect();
  const docs = await PricingTier.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
  const tiers = (docs.length ? docs : fallbackTiers).map((t, i) => ({
    n: i + 1,
    name: t.name,
    price: t.price,
    description: t.description,
    features: t.features,
  }));
  return <PricingContent tiers={tiers} />;
}