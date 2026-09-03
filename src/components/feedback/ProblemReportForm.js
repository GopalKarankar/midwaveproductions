"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/SelectField";
import { TextareaField } from "@/components/ui/TextareaField";

const categoryOptions = [
  { value: "bug", label: "Bug" },
  { value: "ui_issue", label: "UI Issue" },
  { value: "account", label: "Account Issue" },
  { value: "booking", label: "Booking Issue" },
  { value: "payment", label: "Payment Issue" },
  { value: "other", label: "Other" },
];

const severityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const initialFormData = {
  name: "",
  email: "",
  category: "",
  severity: "medium",
  pageUrl: "",
  message: "",
};

export function ProblemReportForm() {
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
      const res = await fetch("/api/problem-reports", {
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
          Report Received
        </h2>
        <p className="font-mono text-xs text-accent-2 tracking-widest uppercase mt-4">
          Thank you for reporting this issue. We'll investigate and get back to you soon.
        </p>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="report-name"
            label="Your Name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange("name")}
          />
          <FormField
            id="report-email"
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={handleChange("email")}
          />
        </div>

        <SelectField
          id="report-category"
          label="Problem Category"
          required
          value={formData.category}
          onChange={handleChange("category")}
          options={categoryOptions}
          placeholder="Select a category"
        />

        <SelectField
          id="report-severity"
          label="Severity"
          value={formData.severity}
          onChange={handleChange("severity")}
          options={severityOptions}
        />

        <FormField
          id="report-page-url"
          label="Page URL (optional)"
          type="text"
          value={formData.pageUrl}
          onChange={handleChange("pageUrl")}
          placeholder="https://midwaveproductions.com/..."
        />

        <TextareaField
          id="report-message"
          label="Problem Description"
          required
          value={formData.message}
          onChange={handleChange("message")}
          placeholder="Describe the issue in detail..."
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
          Submit Report ↗
        </button>
      </form>
    </section>
  );
}
