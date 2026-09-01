"use client";

import { useState, useEffect } from "react";
import { FormField } from "@/components/ui/FormField";
import { TextareaField } from "@/components/ui/TextareaField";
import { RichTextField } from "@/components/ui/RichTextField";
import { SelectField } from "@/components/ui/SelectField";
import { Badge } from "@/components/ui/Badge";
import { ArtistImageUploadField } from "@/components/admin/ArtistImageUploadField";
import { formatFileSize } from "@/lib/media/formatFileSize";

const slugify = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export function ArtistPortfolioEditor({ artist, isAdmin, onSaved, onCancel }) {
  const [formData, setFormData] = useState(() => ({
    stageName: artist?.stageName || "",
    realName: artist?.realName || "",
    slug: artist?.slug || "",
    bio: artist?.bio || "",
    shortBio: artist?.shortBio || "",
    genres: artist?.genres || [],
    socialLinks: artist?.socialLinks || {},
    profileImage: artist?.profileImage || "",
    coverImage: artist?.coverImage || "",
    pressKit: artist?.pressKit || "",
    featuredTracks: artist?.featuredTracks || [],
    upcomingEvents: artist?.upcomingEvents || [],
    ...(isAdmin && {
      isPublished: artist?.isPublished || false,
      isFeatured: artist?.isFeatured || false,
      managedBy: artist?.managedBy || "",
    }),
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [managers, setManagers] = useState([]);

  // Upload state for each file field
  const [profileImageUploadStatus, setProfileImageUploadStatus] = useState(null);
  const [profileImageUploadProgress, setProfileImageUploadProgress] = useState(0);
  const [profileImageSelectedFile, setProfileImageSelectedFile] = useState(null);
  const [profileImageUploadError, setProfileImageUploadError] = useState("");

  const [coverImageUploadStatus, setCoverImageUploadStatus] = useState(null);
  const [coverImageUploadProgress, setCoverImageUploadProgress] = useState(0);
  const [coverImageSelectedFile, setCoverImageSelectedFile] = useState(null);
  const [coverImageUploadError, setCoverImageUploadError] = useState("");

  const [pressKitUploadStatus, setPressKitUploadStatus] = useState(null);
  const [pressKitUploadProgress, setPressKitUploadProgress] = useState(0);
  const [pressKitSelectedFile, setPressKitSelectedFile] = useState(null);
  const [pressKitUploadError, setPressKitUploadError] = useState("");

  // Fetch manager list if admin
  useEffect(() => {
    if (isAdmin) {
      const fetchManagers = async () => {
        try {
          const response = await fetch("/api/users");
          if (response.ok) {
            const data = await response.json();
            const managerUsers = data.users?.filter((u) => u.roles?.includes("manager")) || [];
            setManagers(managerUsers);
          }
        } catch (err) {
          console.error("Failed to fetch managers:", err);
        }
      };
      fetchManagers();
    }
  }, [isAdmin]);

  const isDirty = Boolean(artist?._id)
    ? JSON.stringify(formData) !== JSON.stringify({
        stageName: artist.stageName || "",
        realName: artist.realName || "",
        slug: artist.slug || "",
        bio: artist.bio || "",
        shortBio: artist.shortBio || "",
        genres: artist.genres || [],
        socialLinks: artist.socialLinks || {},
        profileImage: artist.profileImage || "",
        coverImage: artist.coverImage || "",
        pressKit: artist.pressKit || "",
        featuredTracks: artist.featuredTracks || [],
        upcomingEvents: artist.upcomingEvents || [],
        ...(isAdmin && {
          isPublished: artist.isPublished || false,
          isFeatured: artist.isFeatured || false,
          managedBy: artist.managedBy || "",
        }),
      })
    : formData.stageName.trim();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleGenresChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      genres: value ? value.split(",").map((g) => g.trim()).filter(Boolean) : [],
    }));
  };

  const handleAddTrack = () => {
    setFormData((prev) => ({
      ...prev,
      featuredTracks: [...prev.featuredTracks, { title: "", url: "", platform: "spotify" }],
    }));
  };

  const handleRemoveTrack = (index) => {
    setFormData((prev) => ({
      ...prev,
      featuredTracks: prev.featuredTracks.filter((_, i) => i !== index),
    }));
  };

  const handleTrackChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      featuredTracks: prev.featuredTracks.map((track, i) =>
        i === index ? { ...track, [field]: value } : track
      ),
    }));
  };

  const handleAddEvent = () => {
    setFormData((prev) => ({
      ...prev,
      upcomingEvents: [...prev.upcomingEvents, { title: "", date: "", venue: "", city: "", ticketUrl: "" }],
    }));
  };

  const handleRemoveEvent = (index) => {
    setFormData((prev) => ({
      ...prev,
      upcomingEvents: prev.upcomingEvents.filter((_, i) => i !== index),
    }));
  };

  const handleEventChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      upcomingEvents: prev.upcomingEvents.map((event, i) =>
        i === index ? { ...event, [field]: value } : event
      ),
    }));
  };

  const handleGenerateSlug = () => {
    const newSlug = slugify(formData.stageName);
    setFormData((prev) => ({
      ...prev,
      slug: newSlug,
    }));
  };

  const handleSave = async () => {
    if (!formData.stageName.trim()) {
      setErrorMessage("Stage name is required");
      return;
    }
    if (!formData.slug.trim()) {
      setErrorMessage("Slug is required");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const endpoint = artist?._id ? `/api/artists/${artist._id}` : "/api/artists";
      const method = artist?._id ? "PATCH" : "POST";

      const payload = {
        stageName: formData.stageName.trim(),
        realName: formData.realName.trim() || undefined,
        slug: formData.slug.trim(),
        bio: formData.bio || undefined,
        shortBio: formData.shortBio.trim() || undefined,
        genres: formData.genres,
        socialLinks: formData.socialLinks,
        profileImage: formData.profileImage || undefined,
        coverImage: formData.coverImage || undefined,
        pressKit: formData.pressKit || undefined,
        featuredTracks: formData.featuredTracks.filter((t) => t.title && t.url),
        upcomingEvents: formData.upcomingEvents.filter((e) => e.title),
      };

      if (isAdmin && artist?._id) {
        payload.isPublished = formData.isPublished;
        payload.isFeatured = formData.isFeatured;
        if (formData.managedBy) payload.managedBy = formData.managedBy;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to save");
        setIsSaving(false);
        return;
      }

      onSaved(data.artist);
    } catch (err) {
      console.error("Save failed:", err);
      setErrorMessage("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
      <div className="bg-surface border border-border rounded p-6 m-4 max-w-2xl mx-auto my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl uppercase tracking-widest">
            {artist?._id ? "Edit Artist" : "New Artist"}
          </h3>
          <button
            onClick={onCancel}
            className="text-xs font-mono text-muted hover:text-highlight transition-colors"
          >
            ✕ Close
          </button>
        </div>

        <form className="flex flex-col gap-6">
          {/* Basic info */}
          <FormField
            label="Stage Name"
            name="stageName"
            value={formData.stageName}
            onChange={handleChange}
            placeholder="Artist name"
            required
          />

          <FormField
            label="Real Name"
            name="realName"
            value={formData.realName}
            onChange={handleChange}
            placeholder="Full name (optional)"
          />

          <div className="flex flex-col gap-3">
            <label className="font-mono text-xs tracking-widest uppercase text-muted">Slug</label>
            <div className="flex gap-2">
              <FormField
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="url-friendly-slug"
                required
                containerClassName="flex-1"
                labelless
              />
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="px-3 py-2 font-mono text-xs tracking-widest uppercase border border-border hover:bg-surface-2 transition-colors"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Bio section */}
          <RichTextField
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Full biography (up to 2000 chars)"
            maxLength={2000}
          />

          <TextareaField
            label="Short Bio"
            name="shortBio"
            value={formData.shortBio}
            onChange={handleChange}
            placeholder="Brief bio for listings (up to 280 chars)"
            maxLength={280}
          />

          {/* Genres */}
          <FormField
            label="Genres (comma-separated)"
            name="genres"
            value={formData.genres.join(", ")}
            onChange={handleGenresChange}
            placeholder="e.g., Electronic, Hip-Hop, Ambient"
          />

          {/* Social links */}
          <div className="border-b border-border pb-4">
            <label className="text-xs font-mono text-accent-2 tracking-widest uppercase block mb-3">
              Social Links
            </label>
            {["instagram", "spotify", "youtube", "soundcloud", "twitter", "website"].map(
              (platform) => (
                <FormField
                  key={platform}
                  label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  value={formData.socialLinks?.[platform] || ""}
                  onChange={(e) => handleSocialChange(platform, e.target.value)}
                  placeholder={`Your ${platform} URL`}
                  labelless
                />
              )
            )}
          </div>

          {/* Images */}
          <ArtistImageUploadField
            label="Profile Image"
            value={formData.profileImage}
            onChange={(url) => setFormData((prev) => ({ ...prev, profileImage: url }))}
            uploadStatus={profileImageUploadStatus}
            uploadProgress={profileImageUploadProgress}
            selectedFileInfo={profileImageSelectedFile}
            uploadError={profileImageUploadError}
            onUploadStatusChange={setProfileImageUploadStatus}
            onUploadProgressChange={setProfileImageUploadProgress}
            onSelectedFileInfoChange={setProfileImageSelectedFile}
            onUploadErrorChange={setProfileImageUploadError}
            artistId={artist?._id}
          />

          <ArtistImageUploadField
            label="Cover Image"
            value={formData.coverImage}
            onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
            uploadStatus={coverImageUploadStatus}
            uploadProgress={coverImageUploadProgress}
            selectedFileInfo={coverImageSelectedFile}
            uploadError={coverImageUploadError}
            onUploadStatusChange={setCoverImageUploadStatus}
            onUploadProgressChange={setCoverImageUploadProgress}
            onSelectedFileInfoChange={setCoverImageSelectedFile}
            onUploadErrorChange={setCoverImageUploadError}
            artistId={artist?._id}
          />

          {/* Press Kit */}
          <div className="flex flex-col gap-3">
            <label className="font-mono text-xs tracking-widest uppercase text-muted">Press Kit (PDF)</label>
            <div className="border border-dashed border-border rounded p-4 flex flex-col gap-3">
              {!formData.pressKit && (
                <>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setPressKitUploadError("");
                      setPressKitSelectedFile({ name: file.name, size: file.size });

                      if (file.type !== "application/pdf") {
                        setPressKitUploadError("Only PDF files are allowed");
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        setPressKitUploadError("File exceeds 10MB limit");
                        return;
                      }

                      setPressKitUploadStatus("uploading");
                      setPressKitUploadProgress(0);

                      try {
                        const { uploadWithProgress } = await import("@/lib/media/uploadWithProgress");
                        const asset = await uploadWithProgress({
                          file,
                          artistId: artist?._id,
                          onProgress: setPressKitUploadProgress,
                        });
                        setFormData((prev) => ({ ...prev, pressKit: asset.url }));
                        setPressKitUploadStatus("success");
                        setTimeout(() => setPressKitUploadStatus(null), 2000);
                      } catch (err) {
                        console.error("Upload failed:", err);
                        setPressKitUploadError(err.message || "Upload failed");
                        setPressKitUploadStatus("error");
                      }
                    }}
                    disabled={pressKitUploadStatus === "uploading"}
                    className="text-xs"
                  />
                  {pressKitSelectedFile && (
                    <p className="text-xs font-mono text-muted">
                      {pressKitSelectedFile.name} ({formatFileSize(pressKitSelectedFile.size)})
                    </p>
                  )}
                  {pressKitUploadError && (
                    <p className="text-xs text-error font-mono">{pressKitUploadError}</p>
                  )}
                  {pressKitUploadStatus === "uploading" && (
                    <p className="text-xs text-muted">Uploading...</p>
                  )}
                  {pressKitUploadStatus === "success" && (
                    <Badge variant="blue">Upload complete</Badge>
                  )}
                  {pressKitUploadStatus === "error" && (
                    <Badge variant="error">Upload failed</Badge>
                  )}
                </>
              )}
              {formData.pressKit && (
                <div className="flex flex-col gap-2">
                  <a
                    href={formData.pressKit}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:text-accent-hover"
                  >
                    📄 Press Kit PDF
                  </a>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, pressKit: "" }))}
                    className="text-xs font-mono text-error hover:text-error-hover transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Featured Tracks */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono text-accent-2 tracking-widest uppercase block">
                Featured Tracks
              </label>
              <button
                type="button"
                onClick={handleAddTrack}
                className="text-xs font-mono text-accent hover:text-accent-hover"
              >
                + Add
              </button>
            </div>
            {formData.featuredTracks.map((track, index) => (
              <div key={index} className="flex gap-2 mb-3 pb-3 border-b border-border last:border-0">
                <input
                  type="text"
                  placeholder="Track title"
                  value={track.title}
                  onChange={(e) => handleTrackChange(index, "title", e.target.value)}
                  className="flex-1 border-b border-border bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <select
                  value={track.platform}
                  onChange={(e) => handleTrackChange(index, "platform", e.target.value)}
                  className="border-b border-border bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-accent"
                >
                  <option value="spotify">Spotify</option>
                  <option value="soundcloud">SoundCloud</option>
                  <option value="youtube">YouTube</option>
                  <option value="other">Other</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveTrack(index)}
                  className="text-xs font-mono text-error hover:text-error-hover"
                >
                  ✕
                </button>
              </div>
            ))}
            {formData.featuredTracks.length > 0 && (
              <div className="text-xs text-muted mt-2">
                Note: paste the track URL in the first field above
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono text-accent-2 tracking-widest uppercase block">
                Upcoming Events
              </label>
              <button
                type="button"
                onClick={handleAddEvent}
                className="text-xs font-mono text-accent hover:text-accent-hover"
              >
                + Add
              </button>
            </div>
            {formData.upcomingEvents.map((event, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-border last:border-0">
                <input
                  type="text"
                  placeholder="Event title"
                  value={event.title}
                  onChange={(e) => handleEventChange(index, "title", e.target.value)}
                  className="col-span-2 border-b border-border bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <input
                  type="date"
                  value={event.date ? new Date(event.date).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleEventChange(index, "date", e.target.value)}
                  className="border-b border-border bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Venue"
                  value={event.venue}
                  onChange={(e) => handleEventChange(index, "venue", e.target.value)}
                  className="border-b border-border bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={event.city}
                  onChange={(e) => handleEventChange(index, "city", e.target.value)}
                  className="border-b border-border bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <input
                  type="url"
                  placeholder="Ticket URL"
                  value={event.ticketUrl}
                  onChange={(e) => handleEventChange(index, "ticketUrl", e.target.value)}
                  className="col-span-2 border-b border-border bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveEvent(index)}
                  className="col-span-2 text-xs font-mono text-error hover:text-error-hover text-left"
                >
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>

          {/* Admin-only fields */}
          {isAdmin && artist?._id && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="font-mono text-sm uppercase tracking-widest">Published</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="font-mono text-sm uppercase tracking-widest">Featured</span>
              </label>

              <SelectField
                label="Assign Manager"
                name="managedBy"
                value={formData.managedBy}
                onChange={handleChange}
                options={[
                  { value: "", label: "— Unassigned —" },
                  ...managers.map((m) => ({
                    value: m._id,
                    label: m.email,
                  })),
                ]}
              />
            </>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="button"
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
        </form>
      </div>
    </div>
  );
}
