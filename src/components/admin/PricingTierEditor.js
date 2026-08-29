"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";

export function PricingTierEditor({ tier, tierNumber, onSaved, onCancel }) {
  const [formData, setFormData] = useState(() => ({
    name: tier?.name || "",
    price: tier?.price || "",
    description: tier?.description || "",
    features: tier?.features || [],
    order: tier?.order ?? 0,
    isActive: tier?.isActive ?? true,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isDirty = Boolean(tier?._id)
    ? JSON.stringify(formData) !== JSON.stringify({
        name: tier.name || "",
        price: tier.price || "",
        description: tier.description || "",
        features: tier.features || [],
        order: tier.order ?? 0,
        isActive: tier.isActive ?? true,
      })
    : formData.name.trim() || formData.price.trim();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleFeatureChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMessage("Tier name is required");
      return;
    }

    if (!formData.price.trim()) {
      setErrorMessage("Price is required");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const endpoint = tier?._id ? `/api/pricing-tiers/${tier._id}` : "/api/pricing-tiers";
      const method = tier?._id ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          price: formData.price.trim(),
          description: formData.description.trim() || undefined,
          features: formData.features.filter(f => f.trim()),
          order: Number(formData.order) || 0,
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to save");
        setIsSaving(false);
        return;
      }

      onSaved(data.tier);
    } catch (err) {
      console.error("Save failed:", err);
      setErrorMessage("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tier?._id) return;
    if (!window.confirm(`Delete "${formData.name}"?`)) return;

    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/pricing-tiers/${tier._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to delete");
        setIsSaving(false);
        return;
      }

      onSaved(null, "deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      setErrorMessage("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 border border-border rounded p-6 bg-surface">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-accent-2 tracking-widest">N°{tierNumber}</span>
          <h3 className="font-display text-xl uppercase tracking-widest">
            {tier?._id ? "Edit Tier" : "New Tier"}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-mono text-muted hover:text-highlight transition-colors"
        >
          ✕ Close
        </button>
      </div>

      <FormField
        label="Tier Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. ARTIST PROFILE"
      />

      <FormField
        label="Price"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="e.g. FREE, $1,000+, CUSTOM"
      />

      <FormField
        label="Description (optional)"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Short description of this tier"
      />

      <FormField
        label="Display Order"
        name="order"
        type="number"
        value={formData.order}
        onChange={handleChange}
        placeholder="0"
      />

      <div className="flex flex-col gap-3">
        <label className="font-mono text-xs tracking-widest uppercase text-muted">Features</label>
        <div className="flex flex-col gap-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                className="flex-1 bg-bg border-b border-border px-2 py-1 text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={() => handleRemoveFeature(index)}
                className="text-xs font-mono text-error hover:text-error-hover transition-colors px-2 py-1"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={handleAddFeature}
            className="text-xs font-mono text-accent hover:text-accent-hover transition-colors text-left px-2 py-1"
          >
            + Add feature
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <span className="font-mono text-sm uppercase tracking-widest">Active (visible on pricing page)</span>
      </label>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="px-4 py-2 font-mono text-xs tracking-widest uppercase bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-bg transition-colors duration-200"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>

        {tier?._id && (
          <button
            onClick={handleDelete}
            disabled={isSaving}
            className="px-4 py-2 font-mono text-xs tracking-widest uppercase bg-error hover:bg-error-hover disabled:opacity-50 disabled:cursor-not-allowed text-bg transition-colors duration-200"
          >
            {isSaving ? "Deleting..." : "Delete"}
          </button>
        )}

        {isDirty && <Badge variant="muted">Unsaved changes</Badge>}

        {errorMessage && (
          <p className="text-xs text-error font-mono">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
