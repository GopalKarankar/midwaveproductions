"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/SelectField";
import { TextareaField } from "@/components/ui/TextareaField";

const categoryOptions = [
  { value: "general", label: "General Feedback" },
  { value: "feature_request", label: "Feature Request" },
  { value: "praise", label: "Praise" },
  { value: "other", label: "Other" },
];

const ratingOptions = [
  { value: "", label: "No Rating" },
  { value: "1", label: "1 - Poor" },
  { value: "2", label: "2 - Fair" },
  { value: "3", label: "3 - Good" },
  { value: "4", label: "4 - Very Good" },
  { value: "5", label: "5 - Excellent" },
];

const initialFormData = {
  name: "",
  email: "",
  category: "general",
  rating: "",
  message: "",
};

export function FeedbackForm() {
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
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rating: formData.rating ? Number(formData.rating) : undefined,
        }),
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
          Thank You for Your Feedback
        </h2>
        <p className="font-mono text-xs text-accent-2 tracking-widest uppercase mt-4">
          We appreciate your input and will review it shortly.
        </p>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="feedback-name"
            label="Your Name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange("name")}
          />
          <FormField
            id="feedback-email"
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={handleChange("email")}
          />
        </div>

        <SelectField
          id="feedback-category"
          label="Feedback Category"
          value={formData.category}
          onChange={handleChange("category")}
          options={categoryOptions}
        />

        <SelectField
          id="feedback-rating"
          label="Rating (optional)"
          value={formData.rating}
          onChange={handleChange("rating")}
          options={ratingOptions}
        />

        <TextareaField
          id="feedback-message"
          label="Your Feedback"
          required
          value={formData.message}
          onChange={handleChange("message")}
          placeholder="Tell us what you think..."
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
          Send Feedback ↗
        </button>
      </form>
    </section>
  );
}
