"use client";

import { useState, useEffect, useMemo } from "react";
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { SOCIAL_PLATFORMS } from "@/constants/socialPlatforms";

const columnHelper = createColumnHelper();

function createSocialColumns({
  values,
  savedValues,
  updatingKey,
  savedFlashKey,
  onChange,
  onSave,
}) {
  return [
    columnHelper.display({
      id: "label",
      header: "Platform",
      cell: (info) => {
        const platform = info.row.original;
        return (
          <span className="font-mono text-xs text-accent-2 uppercase tracking-widest">
            {platform.label}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "value",
      header: "Link",
      cell: (info) => {
        const platform = info.row.original;
        const key = platform.key;
        return (
          <input
            type="text"
            value={values[key] || ""}
            onChange={(e) => onChange(key, e.target.value)}
            disabled={updatingKey === key}
            placeholder={key === "email" ? "mailto:info@midwaveproductions.com" : "https://..."}
            className="bg-transparent border-0 border-b border-border text-text font-body py-2 focus:outline-none focus:border-accent transition-colors duration-200 placeholder:text-muted disabled:opacity-50 disabled:cursor-not-allowed w-full"
          />
        );
      },
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      cell: (info) => {
        const platform = info.row.original;
        const key = platform.key;
        const isSaved = !!savedValues[key];
        return (
          <Badge variant={isSaved ? "blue" : "muted"}>
            {isSaved ? "SET" : "EMPTY"}
          </Badge>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: (info) => {
        const platform = info.row.original;
        const key = platform.key;
        const isUpdating = updatingKey === key;
        const isSaved = savedFlashKey === key;
        const isDirty = values[key] !== savedValues[key];

        let buttonLabel = "Save";
        if (isUpdating) buttonLabel = "Saving...";
        else if (isSaved) buttonLabel = "Saved ✓";

        return (
          <button
            onClick={() => onSave(key)}
            disabled={isUpdating || !isDirty}
            className="px-2 py-1 text-xs font-mono uppercase tracking-widest rounded border border-border text-text hover:bg-surface-2 hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buttonLabel}
          </button>
        );
      },
    }),
  ];
}

export function SocialLinksTable({ initialLinks = {} }) {
  const [values, setValues] = useState(() => {
    const initial = {};
    for (const { key } of SOCIAL_PLATFORMS) {
      initial[key] = initialLinks[key] || "";
    }
    return initial;
  });

  const [savedValues, setSavedValues] = useState(() => {
    const initial = {};
    for (const { key } of SOCIAL_PLATFORMS) {
      initial[key] = initialLinks[key] || "";
    }
    return initial;
  });

  const [updatingKey, setUpdatingKey] = useState(null);
  const [savedFlashKey, setSavedFlashKey] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Clear "Saved ✓" flash after 2 seconds
  useEffect(() => {
    if (!savedFlashKey) return;
    const timer = setTimeout(() => setSavedFlashKey(null), 2000);
    return () => clearTimeout(timer);
  }, [savedFlashKey]);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const saveOne = async (key) => {
    // Guard: no-op if value hasn't changed
    if (values[key] === savedValues[key]) return;

    setUpdatingKey(key);
    setErrorMessage("");

    try {
      const response = await fetch("/api/settings/social", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: values[key] }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to save");
        return;
      }

      // Merge back the server-trimmed value into both state objects
      const savedValue = data.socialLinks[key];
      setValues((prev) => ({ ...prev, [key]: savedValue }));
      setSavedValues((prev) => ({ ...prev, [key]: savedValue }));
      setSavedFlashKey(key);
    } catch (err) {
      console.error(`Error saving social link (${key}):`, err);
      setErrorMessage("Failed to save");
    } finally {
      setUpdatingKey(null);
    }
  };

  const rows = useMemo(
    () => SOCIAL_PLATFORMS.map((p) => ({ key: p.key, label: p.label })),
    []
  );

  const columns = useMemo(
    () =>
      createSocialColumns({
        values,
        savedValues,
        updatingKey,
        savedFlashKey,
        onChange: handleChange,
        onSave: saveOne,
      }),
    [values, savedValues, updatingKey, savedFlashKey]
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <p className="font-mono text-xs text-error tracking-widest uppercase">
          {errorMessage}
        </p>
      )}

      <DataTable table={table} emptyMessage="No platforms configured." />
    </div>
  );
}
