import { pricingTiers } from "@/lib/data/placeholderPricing";
import { PricingContent } from "@/components/sections/PricingContent";

export const metadata = {
  title: "Pricing - Midwave Productions",
};

export default function PricingPage() {
  return <PricingContent tiers={pricingTiers} />;
}