"use client";

import { useState } from "react";

export function ArtistsAdminTable({ artists }) {
  const [localArtists, setLocalArtists] = useState(artists);
  const [isLoading, setIsLoading] = useState(false);

  const toggleField = async (artistId, field) => {
    setIsLoading(true);
    try {
      const artist = localArtists.find((a) => a._id.toString() === artistId);
      const newValue = !artist[field];

      const response = await fetch(`/api/artists/${artistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setLocalArtists((prev) =>
        prev.map((a) =>
          a._id.toString() === artistId ? { ...a, [field]: newValue } : a
        )
      );
    } catch (err) {
      console.error("Error updating artist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface">
          <tr>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
              Stage Name
            </th>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
              Genres
            </th>
            <th className="text-center px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
              Published
            </th>
            <th className="text-center px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
              Featured
            </th>
          </tr>
        </thead>
        <tbody>
          {localArtists.map((artist) => (
            <tr key={artist._id} className="border-t border-border hover:bg-surface-2 transition-colors">
              <td className="px-4 py-3 font-body text-highlight">{artist.stageName}</td>
              <td className="px-4 py-3 font-body text-muted text-xs">
                {artist.genres?.join(", ") || "—"}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => toggleField(artist._id.toString(), "isPublished")}
                  disabled={isLoading}
                  className={`w-6 h-6 border rounded transition-colors ${
                    artist.isPublished
                      ? "bg-success border-success"
                      : "border-border hover:border-accent"
                  }`}
                  title={artist.isPublished ? "Published" : "Draft"}
                />
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => toggleField(artist._id.toString(), "isFeatured")}
                  disabled={isLoading}
                  className={`w-6 h-6 border rounded transition-colors ${
                    artist.isFeatured
                      ? "bg-accent-2 border-accent-2"
                      : "border-border hover:border-accent"
                  }`}
                  title={artist.isFeatured ? "Featured" : "Not featured"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
