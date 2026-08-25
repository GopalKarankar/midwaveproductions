"use client";

import { useState } from "react";
import Image from "next/image";
import { isGifAsset } from "@/lib/media/isGifAsset";

const TYPE_LABELS = {
  image: "Image",
  audio: "Audio",
  video: "Video",
  document: "Document",
};

export function MediaAdminBrowser({ assets }) {
  const [localAssets, setLocalAssets] = useState(assets);
  const [isDeleting, setIsDeleting] = useState(null);

  const deleteAsset = async (assetId) => {
    if (!confirm("Delete this media file? This action cannot be undone.")) return;

    setIsDeleting(assetId);
    try {
      const response = await fetch(`/api/media/${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setLocalAssets((prev) => prev.filter((a) => a._id.toString() !== assetId));
    } catch (err) {
      console.error("Error deleting media:", err);
      alert("Failed to delete media file");
    } finally {
      setIsDeleting(null);
    }
  };

  const groupedByType = {
    image: localAssets.filter((a) => a.type === "image"),
    video: localAssets.filter((a) => a.type === "video"),
    audio: localAssets.filter((a) => a.type === "audio"),
    document: localAssets.filter((a) => a.type === "document"),
  };

  return (
    <div className="flex flex-col gap-12">
      {Object.entries(groupedByType).map(([type, items]) =>
        items.length > 0 ? (
          <div key={type}>
            <h2 className="text-lg font-display uppercase tracking-display text-accent-2 mb-6">
              {TYPE_LABELS[type]} ({items.length})
            </h2>
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface">
                  <tr>
                    {type === "image" && (
                      <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                        Preview
                      </th>
                    )}
                    <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                      Filename
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                      Artist
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                      Size
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                      Uploaded
                    </th>
                    <th className="text-center px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((asset) => (
                    <tr
                      key={asset._id}
                      className="border-t border-border hover:bg-surface-2 transition-colors"
                    >
                      {type === "image" && (
                        <td className="px-4 py-3">
                          {isGifAsset(asset.mimeType) ? (
                            <img
                              src={asset.url}
                              alt={asset.filename}
                              className="w-16 h-16 object-cover border border-border"
                            />
                          ) : (
                            <Image
                              src={asset.url}
                              alt={asset.filename}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover border border-border"
                            />
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 font-body text-highlight truncate">
                        {asset.filename}
                      </td>
                      <td className="px-4 py-3 font-body text-muted text-xs">
                        {asset.artistId?.stageName || "—"}
                      </td>
                      <td className="px-4 py-3 font-body text-muted text-xs">
                        {asset.size ? (asset.size / 1024 / 1024).toFixed(2) : "—"} MB
                      </td>
                      <td className="px-4 py-3 font-body text-muted text-xs">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteAsset(asset._id.toString())}
                          disabled={isDeleting === asset._id.toString()}
                          className="text-error hover:text-error-hover transition-colors text-xs font-mono uppercase tracking-widest disabled:opacity-50"
                        >
                          {isDeleting === asset._id.toString() ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null
      )}

      {localAssets.length === 0 && (
        <p className="font-body text-muted text-center py-12">No media files yet.</p>
      )}
    </div>
  );
}
