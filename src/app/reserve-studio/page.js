import { Suspense } from "react";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { ReserveStudioForm } from "@/components/reserveStudio/ReserveStudioForm";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Reserve Studio — Midwave Productions",
  description: "Submit a studio reservation request at Midwave Productions.",
};

export default function ReserveStudioPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 md:px-12 pt-16 pb-8">
        <div className="flex items-start justify-between">
          <SectionNumber n="5" />
          <VersionLabel />
        </div>
        <SectionHeading>Reserve Studio</SectionHeading>
        <p className="font-mono text-xs text-muted tracking-widest uppercase">
          Request a session
        </p>
      </section>

      <Suspense fallback={null}>
        <ReserveStudioForm />
      </Suspense>

      <Footer />
    </main>
  );
}
