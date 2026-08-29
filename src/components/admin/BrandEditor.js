"use client";

import { useState, useRef } from "react";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { UploadProgressBar } from "@/components/ui/UploadProgressBar";
import { uploadWithProgress } from "@/lib/media/uploadWithProgress";
import { MIME_RULES } from "@/lib/media/mimeRules";
import { formatFileSize } from "@/lib/media/formatFileSize";

export function BrandEditor({ brand, onSaved, onCancel }) {
  const [formData, setFormData] = useState(() => ({
    name: brand?.name || "",
    websiteUrl: brand?.websiteUrl || "",
    logoUrl: brand?.logoUrl || "",
    isActive: brand?.isActive || false,
    isFeatured: brand?.isFeatured || false,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFileInfo, setSelectedFileInfo] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const isDirty = Boolean(brand?._id)
    ? JSON.stringify(formData) !== JSON.stringify({
        name: brand.name || "",
        websiteUrl: brand.websiteUrl || "",
        logoUrl: brand.logoUrl || "",
        isActive: brand.isActive || false,
        isFeatured: brand.isFeatured || false,
      })
    : formData.name.trim();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setSelectedFileInfo({ name: file.name, size: file.size });

    const rule = MIME_RULES[file.type];
    if (!rule) {
      setUploadError("Unsupported file type");
      return;
    }
    if (file.size > rule.maxSize) {
      const maxSizeMB = Math.round(rule.maxSize / (1024 * 1024));
      setUploadError(`File exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      const asset = await uploadWithProgress({ file, onProgress: setUploadProgress });
      setFormData((prev) => ({
        ...prev,
        logoUrl: asset.url,
      }));
      setUploadStatus("success");
      setTimeout(() => setUploadStatus(null), 2000);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "Upload failed");
      setUploadStatus("error");
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoUrl: "",
    }));
    setSelectedFileInfo(null);
    setUploadError("");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMessage("Brand name is required");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const endpoint = brand?._id ? `/api/brands/${brand._id}` : "/api/brands";
      const method = brand?._id ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          websiteUrl: formData.websiteUrl.trim() || undefined,
          logoUrl: formData.logoUrl || undefined,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to save");
        setIsSaving(false);
        return;
      }

      onSaved(data.brand);
    } catch (err) {
      console.error("Save failed:", err);
      setErrorMessage("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 border border-border rounded p-6 bg-surface">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl uppercase tracking-widest">
          {brand?._id ? "Edit Brand" : "New Brand"}
        </h3>
        <button
          onClick={onCancel}
          className="text-xs font-mono text-muted hover:text-highlight transition-colors"
        >
          ✕ Close
        </button>
      </div>

      <FormField
        label="Brand Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. Sundial Festival"
      />

      <FormField
        label="Website URL (optional)"
        name="websiteUrl"
        value={formData.websiteUrl}
        onChange={handleChange}
        placeholder="https://example.com"
        type="url"
      />

      <div className="flex flex-col gap-3">
        <label className="font-mono text-xs tracking-widest uppercase text-muted">Logo (optional)</label>
        <div className="border border-dashed border-border rounded p-4 flex flex-col gap-3">
          {!formData.logoUrl && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploadStatus === "uploading"}
                className="text-xs"
              />
              {selectedFileInfo && (
                <p className="text-xs font-mono text-muted">
                  {selectedFileInfo.name} ({formatFileSize(selectedFileInfo.size)})
                </p>
              )}
              {uploadError && (
                <p className="text-xs text-error font-mono">{uploadError}</p>
              )}
              {uploadStatus === "uploading" && (
                <>
                  <UploadProgressBar value={uploadProgress} status="uploading" />
                  <p className="text-xs text-muted">Uploading...</p>
                </>
              )}
              {uploadStatus === "success" && (
                <Badge variant="blue">Upload complete</Badge>
              )}
              {uploadStatus === "error" && (
                <Badge variant="error">Upload failed</Badge>
              )}
            </>
          )}
          {formData.logoUrl && (
            <div className="flex flex-col gap-2">
              <img
                src={formData.logoUrl}
                alt="Logo preview"
                className="h-16 w-auto max-w-xs object-contain grayscale"
              />
              <button
                onClick={handleRemoveLogo}
                className="text-xs font-mono text-error hover:text-error-hover transition-colors"
              >
                Remove logo
              </button>
            </div>
          )}
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
        <span className="font-mono text-sm uppercase tracking-widest">Active (visible on homepage)</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="isFeatured"
          checked={formData.isFeatured}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <span className="font-mono text-sm uppercase tracking-widest">Featured (appears first)</span>
      </label>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="px-4 py-2 font-mono text-xs tracking-widest uppercase bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-bg transition-colors duration-200"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>

        {isDirty && <Badge variant="muted">Unsaved changes</Badge>}

        {errorMessage && (
          <p className="text-xs text-error font-mono">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
