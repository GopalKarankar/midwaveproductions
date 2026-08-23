import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfoSection } from "@/components/sections/ContactInfoSection";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Contact — Midwave Productions",
  description: "Get in touch with Midwave Productions.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col gap-4 px-6 md:px-12 pt-16 pb-8">
        <SectionNumber n="0" />
        <SectionHeading>Contact</SectionHeading>
        <p className="font-mono text-xs text-muted tracking-widest uppercase">
          Get in touch
        </p>
      </section>

      <ContactForm />
      <ContactInfoSection />
      <Footer />
    </main>
  );
}
