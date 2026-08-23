"use client";
import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { TextareaField } from "@/components/ui/TextareaField";

const initialFormData = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState("idle"); // idle | submitting | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(field) {
    return (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <section className="px-6 md:px-12 py-24">
        <h2 className="font-display text-5xl text-highlight uppercase tracking-display leading-none">
          Your Message Has Been Sent
        </h2>
        <p className="font-mono text-xs text-accent-2 tracking-widest uppercase mt-4">
          We&apos;ll get back to you shortly.
        </p>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="contact-name"
            label="Your Name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange("name")}
          />
          <FormField
            id="contact-email"
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={handleChange("email")}
          />
        </div>

        <FormField
          id="contact-subject"
          label="Subject (optional)"
          type="text"
          value={formData.subject}
          onChange={handleChange("subject")}
        />

        <TextareaField
          id="contact-message"
          label="Message"
          required
          value={formData.message}
          onChange={handleChange("message")}
        />

        {status === "error" && (
          <p className="font-mono text-xs text-error tracking-widest uppercase">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-accent text-bg font-display text-lg tracking-display uppercase text-center py-4 hover:bg-accent-hover transition-colors duration-200 disabled:opacity-60"
        >
          Send Message ↗
        </button>
      </form>
    </section>
  );
}
