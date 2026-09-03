import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VersionLabel } from "@/components/ui/VersionLabel";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Give Feedback — Midwave Productions", description: "Share your feedback about Midwave Productions. We'd love to hear your thoughts and suggestions." };

export default function FeedbackPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 md:px-12 pt-16 pb-8">
        <div className="flex items-start justify-between">
          <SectionNumber n="9" />
          <VersionLabel />
        </div>
        <SectionHeading>Give Feedback</SectionHeading>
        <p className="font-mono text-xs text-muted tracking-widest uppercase">Share your thoughts</p>
      </section>
      <FeedbackForm />
      <Footer />
    </main>
  );
}
