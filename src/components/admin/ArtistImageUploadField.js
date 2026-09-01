"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { UploadProgressBar } from "@/components/ui/UploadProgressBar";
import { uploadWithProgress } from "@/lib/media/uploadWithProgress";
import { MIME_RULES } from "@/lib/media/mimeRules";
import { formatFileSize } from "@/lib/media/formatFileSize";

export function ArtistImageUploadField({
  label,
  value,
  onChange,
  uploadStatus,
  uploadProgress,
  selectedFileInfo,
  uploadError,
  onUploadStatusChange,
  onUploadProgressChange,
  onSelectedFileInfoChange,
  onUploadErrorChange,
  artistId,
}) {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUploadErrorChange("");
    onSelectedFileInfoChange({ name: file.name, size: file.size });

    const rule = MIME_RULES[file.type];
    if (!rule) {
      onUploadErrorChange("Unsupported file type");
      return;
    }
    if (file.size > rule.maxSize) {
      const maxSizeMB = Math.round(rule.maxSize / (1024 * 1024));
      onUploadErrorChange(`File exceeds ${maxSizeMB}MB limit`);
      return;
    }

    onUploadStatusChange("uploading");
    onUploadProgressChange(0);

    try {
      const asset = await uploadWithProgress({ file, artistId, onProgress: onUploadProgressChange });
      onChange(asset.url);
      onUploadStatusChange("success");
      setTimeout(() => onUploadStatusChange(null), 2000);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload failed:", err);
      onUploadErrorChange(err.message || "Upload failed");
      onUploadStatusChange("error");
    }
  };

  const handleRemove = () => {
    onChange("");
    onSelectedFileInfoChange(null);
    onUploadErrorChange("");
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="font-mono text-xs tracking-widest uppercase text-muted">{label}</label>
      <div className="border border-dashed border-border rounded p-4 flex flex-col gap-3">
        {!value && (
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
            {uploadError && <p className="text-xs text-error font-mono">{uploadError}</p>}
            {uploadStatus === "uploading" && (
              <>
                <UploadProgressBar value={uploadProgress} status="uploading" />
                <p className="text-xs text-muted">Uploading...</p>
              </>
            )}
            {uploadStatus === "success" && <Badge variant="blue">Upload complete</Badge>}
            {uploadStatus === "error" && <Badge variant="error">Upload failed</Badge>}
          </>
        )}
        {value && (
          <div className="flex flex-col gap-2">
            <img
              src={value}
              alt={label}
              className="h-16 w-auto max-w-xs object-contain"
            />
            <button
              onClick={handleRemove}
              className="text-xs font-mono text-error hover:text-error-hover transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
