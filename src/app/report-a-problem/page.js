import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { ProblemReportForm } from "@/components/feedback/ProblemReportForm";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Report a Problem — Midwave Productions", description: "Report a problem or bug you've encountered on Midwave Productions. Help us improve your experience." };

export default function ReportAProblemPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 md:px-12 pt-16 pb-8">
        <div className="flex items-start justify-between">
          <SectionNumber n="10" />
          <VersionLabel />
        </div>
        <SectionHeading>Report a Problem</SectionHeading>
        <p className="font-mono text-xs text-muted tracking-widest uppercase">Let us know what&apos;s broken</p>
      </section>
      <ProblemReportForm />
      <Footer />
    </main>
  );
}
