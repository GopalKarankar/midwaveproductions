"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/SelectField";
import { UploadProgressBar } from "@/components/ui/UploadProgressBar";
import { MIME_RULES, ACCEPT_ATTR } from "@/lib/media/mimeRules";
import { uploadWithProgress } from "@/lib/media/uploadWithProgress";
import { extractYoutubeVideoId } from "@/lib/media/parseYoutubeUrl";

export function MediaUploadForm({ artists = [] }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [sourceMode, setSourceMode] = useState("upload");
  const [file, setFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [artistId, setArtistId] = useState("");
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const artistOptions = artists.map((artist) => ({
    value: artist._id.toString(),
    label: artist.stageName,
  }));

  const handleSourceModeChange = (mode) => {
    setSourceMode(mode);
    setErrorMessage("");
    if (mode === "upload") {
      setYoutubeUrl("");
    } else {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setErrorMessage("");

    const rule = MIME_RULES[selectedFile.type];
    if (!rule) {
      setErrorMessage("Unsupported file type");
      return;
    }

    if (selectedFile.size > rule.maxSize) {
      const maxSizeMB = Math.round(rule.maxSize / (1024 * 1024));
      setErrorMessage(`File exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setFile(selectedFile);
  };

  const handleYoutubeUrlChange = (e) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    setErrorMessage("");

    if (url && !extractYoutubeVideoId(url)) {
      setErrorMessage("Invalid YouTube URL");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sourceMode === "upload" && !file) return;
    if (sourceMode === "youtube" && (!youtubeUrl || !extractYoutubeVideoId(youtubeUrl))) return;

    setStatus("uploading");
    setProgress(0);
    setErrorMessage("");

    try {
      await uploadWithProgress({
        ...(sourceMode === "upload" && { file }),
        ...(sourceMode === "youtube" && { youtubeUrl }),
        artistId: artistId || null,
        label: label || null,
        onProgress: setProgress,
      });

      setProgress(100);
      setStatus("success");

      setTimeout(() => {
        setFile(null);
        setYoutubeUrl("");
        setLabel("");
        setProgress(0);
        setStatus("idle");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        router.refresh();
      }, 1200);
    } catch (error) {
      let message = "Upload failed";

      if (error.status === 400) {
        message = error.message || "Invalid file or request";
      } else if (error.status === 401) {
        message = "Your session has expired. Please sign in again.";
      } else if (error.status === 403) {
        message = "You don't have permission to upload media.";
      } else if (error.status === 429) {
        const retryAfter = error.retryAfter || "60";
        message = `Too many uploads. Try again in ${retryAfter}s.`;
      } else if (error.status === 500) {
        message = "Upload failed. Please try again.";
      } else if (error.status === 0) {
        message = "Network error — check your connection and try again.";
      }

      setErrorMessage(message);
      setStatus("error");
    }
  };

  return (
    <div className="mb-8 border border-border p-6">
      <h2 className="text-lg font-mono text-accent-2 uppercase tracking-widest mb-6">Upload Media</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source mode toggle */}
        <div>
          <label className="block font-mono text-xs text-accent-2 uppercase tracking-widest mb-3">Mode</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSourceModeChange("upload")}
              className={`flex-1 px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${
                sourceMode === "upload"
                  ? "border-accent bg-accent text-black"
                  : "border-border hover:border-accent text-muted"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => handleSourceModeChange("youtube")}
              className={`flex-1 px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${
                sourceMode === "youtube"
                  ? "border-accent bg-accent text-black"
                  : "border-border hover:border-accent text-muted"
              }`}
            >
              YouTube Link
            </button>
          </div>
        </div>

        {/* File picker */}
        {sourceMode === "upload" && (
          <div>
            <label className="block font-mono text-xs text-accent-2 uppercase tracking-widest mb-2">File</label>
            <label
              htmlFor="media-file"
              className="block cursor-pointer border border-border hover:border-accent transition-colors px-4 py-6 text-center font-mono text-xs text-muted uppercase tracking-widest"
            >
              {file ? file.name : "Click to select a file"}
            </label>
            <input
              id="media-file"
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_ATTR}
              onChange={handleFileChange}
              className="sr-only"
            />
            {errorMessage && status === "idle" && (
              <p className="mt-2 font-mono text-xs text-error">{errorMessage}</p>
            )}
          </div>
        )}

        {/* YouTube URL field */}
        {sourceMode === "youtube" && (
          <div>
            <FormField
              label="YouTube URL"
              type="text"
              value={youtubeUrl}
              onChange={handleYoutubeUrlChange}
              placeholder="https://youtube.com/watch?v=..."
            />
            {errorMessage && status === "idle" && (
              <p className="mt-2 font-mono text-xs text-error">{errorMessage}</p>
            )}
          </div>
        )}

        {/* Artist dropdown */}
        <SelectField
          label="Artist (optional)"
          value={artistId}
          onChange={(e) => setArtistId(e.target.value)}
          options={artistOptions}
          placeholder="No artist"
        />

        {/* Label field */}
        <FormField
          label="Label (optional)"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Remix, Demo, Master"
        />

        {/* Progress bar */}
        {status !== "idle" && <UploadProgressBar value={progress} status={status} />}

        {/* Error message (after upload attempt) */}
        {errorMessage && status !== "idle" && (
          <p className="font-mono text-xs text-error">{errorMessage}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={
            (sourceMode === "upload" ? !file : !youtubeUrl || !extractYoutubeVideoId(youtubeUrl)) ||
            status === "uploading"
          }
          className="w-full px-4 py-3 font-mono text-xs uppercase tracking-widest border border-border bg-accent text-black hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "uploading" ? "Uploading..." : status === "success" ? "Success!" : "Upload"}
        </button>
      </form>
    </div>
  );
}
