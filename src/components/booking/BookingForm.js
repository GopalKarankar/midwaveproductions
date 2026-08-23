"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FormField } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/SelectField";
import { TextareaField } from "@/components/ui/TextareaField";
import { placeholderArtists } from "@/lib/data/placeholderArtists";

const eventTypeOptions = [
  { value: "concert", label: "Concert" },
  { value: "festival", label: "Festival" },
  { value: "private_event", label: "Private Event" },
  { value: "corporate", label: "Corporate" },
  { value: "collaboration", label: "Collaboration" },
  { value: "other", label: "Other" },
];

const artistOptions = placeholderArtists.map((artist) => ({
  value: artist.slug,
  label: artist.stageName,
}));

const initialFormData = {
  artistSlug: "",
  requesterName: "",
  requesterEmail: "",
  requesterPhone: "",
  organization: "",
  eventType: "",
  eventDate: "",
  eventLocation: "",
  budget: "",
  message: "",
};

export function BookingForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState(() => ({
    ...initialFormData,
    artistSlug: searchParams.get("artist") || "",
  }));
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
      const res = await fetch("/api/bookings", {
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
          Your Inquiry Has Been Sent
        </h2>
        <p className="font-mono text-xs text-accent-2 tracking-widest uppercase mt-4">
          We&apos;ll be in touch within 2 business days.
        </p>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
        <SelectField
          id="booking-artist"
          label="Artist"
          required
          value={formData.artistSlug}
          onChange={handleChange("artistSlug")}
          options={artistOptions}
          placeholder="Select an artist"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="booking-name"
            label="Your Name"
            type="text"
            required
            value={formData.requesterName}
            onChange={handleChange("requesterName")}
          />
          <FormField
            id="booking-email"
            label="Email Address"
            type="email"
            required
            value={formData.requesterEmail}
            onChange={handleChange("requesterEmail")}
          />
          <FormField
            id="booking-phone"
            label="Phone (optional)"
            type="tel"
            value={formData.requesterPhone}
            onChange={handleChange("requesterPhone")}
          />
          <FormField
            id="booking-organization"
            label="Organization (optional)"
            type="text"
            value={formData.organization}
            onChange={handleChange("organization")}
          />
        </div>

        <SelectField
          id="booking-event-type"
          label="Event Type"
          required
          value={formData.eventType}
          onChange={handleChange("eventType")}
          options={eventTypeOptions}
          placeholder="Select an event type"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="booking-event-date"
            label="Event Date (optional)"
            type="date"
            value={formData.eventDate}
            onChange={handleChange("eventDate")}
          />
          <FormField
            id="booking-event-location"
            label="Event Location (optional)"
            type="text"
            value={formData.eventLocation}
            onChange={handleChange("eventLocation")}
          />
        </div>

        <FormField
          id="booking-budget"
          label="Budget (optional)"
          type="text"
          value={formData.budget}
          onChange={handleChange("budget")}
        />

        <TextareaField
          id="booking-message"
          label="Message (optional)"
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
          Send Inquiry ↗
        </button>
      </form>
    </section>
  );
}
