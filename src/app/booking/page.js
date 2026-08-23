import { Suspense } from "react";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { BookingForm } from "@/components/booking/BookingForm";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Booking Inquiry — Midwave Productions",
  description: "Send a booking inquiry for a Midwave Productions artist.",
};

export default function BookingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 md:px-12 pt-16 pb-8">
        <div className="flex items-start justify-between">
          <SectionNumber n="4" />
          <VersionLabel />
        </div>
        <SectionHeading>Booking Inquiry</SectionHeading>
        <p className="font-mono text-xs text-muted tracking-widest uppercase">
          Send a request
        </p>
      </section>

      <Suspense fallback={null}>
        <BookingForm />
      </Suspense>

      <Footer />
    </main>
  );
}
