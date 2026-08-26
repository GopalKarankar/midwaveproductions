"use client";

import { useState } from "react";

export function ArtistsAdminTable({ artists }) {
  const [localArtists, setLocalArtists] = useState(artists);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorId, setErrorId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleField = async (artistId, field) => {
    const artist = localArtists.find((a) => a._id.toString() === artistId);
    const newValue = !artist[field];

    setUpdatingId(artistId);
    setErrorId(null);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/artists/${artistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorId(artistId);
        setErrorMessage(data.error || "Failed to update");
        return;
      }

      setLocalArtists((prev) =>
        prev.map((a) =>
          a._id.toString() === artistId ? { ...a, [field]: newValue } : a
        )
      );
    } catch (err) {
      console.error("Error updating artist:", err);
      setErrorId(artistId);
      setErrorMessage("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteArtist = async (artistId) => {
    if (!window.confirm("Delete this artist? This will also remove their media files and booking records. This action cannot be undone.")) return;

    setDeletingId(artistId);
    setErrorId(null);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/artists/${artistId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorId(artistId);
        setErrorMessage(data.error || "Failed to delete artist");
        return;
      }

      setLocalArtists((prev) => prev.filter((a) => a._id.toString() !== artistId));
    } catch (err) {
      console.error("Error deleting artist:", err);
      setErrorId(artistId);
      setErrorMessage("Failed to delete artist");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredArtists = localArtists.filter((artist) => {
    const query = searchQuery.toLowerCase();
    return (
      artist.stageName.toLowerCase().includes(query) ||
      (artist.genres && artist.genres.some((g) => g.toLowerCase().includes(query)))
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search by name or genre..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md bg-transparent border-b border-border px-0 py-2 text-sm font-body text-highlight placeholder-muted focus:outline-none focus:border-accent transition-colors"
      />

      {errorMessage && (
        <p className="font-mono text-xs text-error tracking-widest uppercase">
          {errorMessage}
        </p>
      )}

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
              <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Manager
              </th>
              <th className="text-center px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Published
              </th>
              <th className="text-center px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Featured
              </th>
              <th className="text-center px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredArtists.map((artist) => (
              <tr key={artist._id} className="border-t border-border hover:bg-surface-2 transition-colors">
                <td className="px-4 py-3 font-body text-highlight">{artist.stageName}</td>
                <td className="px-4 py-3 font-body text-muted text-xs">
                  {artist.genres?.join(", ") || "—"}
                </td>
                <td className="px-4 py-3 font-body text-muted text-xs">
                  {artist.managedBy ? `${artist.managedBy.name} (${artist.managedBy.email})` : "— Unmanaged —"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleField(artist._id.toString(), "isPublished")}
                    disabled={updatingId === artist._id.toString()}
                    className={`w-6 h-6 border rounded transition-colors disabled:opacity-50 ${
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
                    disabled={updatingId === artist._id.toString()}
                    className={`w-6 h-6 border rounded transition-colors disabled:opacity-50 ${
                      artist.isFeatured
                        ? "bg-accent-2 border-accent-2"
                        : "border-border hover:border-accent"
                    }`}
                    title={artist.isFeatured ? "Featured" : "Not featured"}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => deleteArtist(artist._id.toString())}
                    disabled={deletingId === artist._id.toString() || updatingId === artist._id.toString()}
                    className="font-mono text-xs text-error hover:text-error-hover disabled:opacity-50 transition-colors"
                  >
                    {deletingId === artist._id.toString() ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredArtists.length === 0 && (
        <p className="font-body text-muted text-center py-8">No artists found.</p>
      )}
    </div>
  );
}
