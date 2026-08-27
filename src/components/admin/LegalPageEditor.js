"use client";

import { useState, useRef, useEffect } from "react";
import { TextareaField } from "@/components/ui/TextareaField";
import { Badge } from "@/components/ui/Badge";

export function LegalPageEditor({ pageKey, initialContent }) {
  const [value, setValue] = useState(initialContent || "");
  const [savedValue, setSavedValue] = useState(initialContent || "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const flashTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const isDirty = value !== savedValue;

  const handleSave = async () => {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/settings/legal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [pageKey]: value }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to save");
        setIsSaving(false);
        return;
      }

      const data = await res.json();
      setSavedValue(value);
      setSavedFlash(true);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
      setErrorMessage("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <TextareaField
          id={`legal-${pageKey}`}
          label={`Page Content`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={20}
          placeholder="Enter content here. Separate paragraphs with a blank line."
        />
        <p className="text-xs text-muted mt-2 font-mono tracking-widest uppercase">
          Separate paragraphs with a blank line
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="px-4 py-2 font-mono text-xs tracking-widest uppercase bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-bg transition-colors duration-200"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>

        {isDirty && (
          <Badge variant="muted">
            Unsaved
          </Badge>
        )}

        {savedFlash && (
          <Badge variant="blue">
            Saved
          </Badge>
        )}

        {errorMessage && (
          <p className="text-xs text-error font-mono">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
