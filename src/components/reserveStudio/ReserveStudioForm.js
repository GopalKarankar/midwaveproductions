"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/SelectField";
import { TextareaField } from "@/components/ui/TextareaField";

const purposeOptions = [
  { value: "recording", label: "Recording" },
  { value: "mixing", label: "Mixing" },
  { value: "mastering", label: "Mastering" },
  { value: "rehearsal", label: "Rehearsal" },
  { value: "podcast", label: "Podcast" },
  { value: "other", label: "Other" },
];

const durationOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} hour${i + 1 > 1 ? "s" : ""}`,
}));

const initialFormData = {
  requesterName: "",
  requesterEmail: "",
  requesterPhone: "",
  preferredDate: "",
  startTime: "",
  durationHours: "",
  purpose: "",
  message: "",
};

export function ReserveStudioForm() {
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
      const payload = {
        requesterName: formData.requesterName,
        requesterEmail: formData.requesterEmail,
        requesterPhone: formData.requesterPhone,
        preferredDate: formData.preferredDate,
        startTime: formData.startTime,
        durationHours: parseInt(formData.durationHours, 10),
        purpose: formData.purpose,
        message: formData.message,
      };

      const res = await fetch("/api/reserve-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          Your Reservation Request Has Been Sent
        </h2>
        <p className="font-mono text-xs text-accent-2 tracking-widest uppercase mt-4">
          We&apos;ll review your request and get back to you within 2 business days.
        </p>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="studio-name"
            label="Your Name"
            type="text"
            required
            value={formData.requesterName}
            onChange={handleChange("requesterName")}
          />
          <FormField
            id="studio-email"
            label="Email Address"
            type="email"
            required
            value={formData.requesterEmail}
            onChange={handleChange("requesterEmail")}
          />
        </div>

        <FormField
          id="studio-phone"
          label="Phone (optional)"
          type="tel"
          value={formData.requesterPhone}
          onChange={handleChange("requesterPhone")}
        />

        <SelectField
          id="studio-purpose"
          label="Purpose"
          required
          value={formData.purpose}
          onChange={handleChange("purpose")}
          options={purposeOptions}
          placeholder="Select a purpose"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="studio-date"
            label="Preferred Date"
            type="date"
            required
            value={formData.preferredDate}
            onChange={handleChange("preferredDate")}
          />
          <FormField
            id="studio-time"
            label="Start Time"
            type="time"
            required
            value={formData.startTime}
            onChange={handleChange("startTime")}
          />
        </div>

        <SelectField
          id="studio-duration"
          label="Duration"
          required
          value={formData.durationHours}
          onChange={handleChange("durationHours")}
          options={durationOptions}
          placeholder="Select duration"
        />

        <TextareaField
          id="studio-message"
          label="Message (optional)"
          value={formData.message}
          onChange={handleChange("message")}
          placeholder="Tell us more about your project..."
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
          Request Studio Time ↗
        </button>
      </form>
    </section>
  );
}
