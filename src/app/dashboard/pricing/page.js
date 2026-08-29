import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import dbConnect from "@/lib/mongodb/connect";
import PricingTier from "@/lib/mongodb/models/PricingTier";
import { serializeDocs } from "@/lib/mongodb/queryHelpers";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricingTiersAdminList } from "@/components/admin/PricingTiersAdminList";

export const metadata = {
  title: "Pricing - Midwave Productions",
};

export default async function DashboardPricingPage() {
  const { session, profile } = await getSession();

  if (!session || !profile?.roles?.includes("admin")) {
    redirect("/");
  }

  await dbConnect();

  const tiers = await PricingTier.find({}).sort({ order: 1 }).lean();
  const serialized = serializeDocs(tiers);

  return (
    <div className="px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n="16" />
        <SectionHeading className="!text-3xl">Pricing & Work Structure</SectionHeading>
      </div>
      <PricingTiersAdminList tiers={serialized} />
    </div>
  );
}
