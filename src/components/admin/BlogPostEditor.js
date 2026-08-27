"use client";

import { useState, useRef, useEffect } from "react";
import { TextareaField } from "@/components/ui/TextareaField";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { UploadProgressBar } from "@/components/ui/UploadProgressBar";
import { uploadWithProgress } from "@/lib/media/uploadWithProgress";
import { slugify } from "@/lib/utils/slugify";

export function BlogPostEditor({ post, onSaved, onCancel }) {
  const [formData, setFormData] = useState(() => ({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    body: post?.body || "",
    coverImage: post?.coverImage || "",
    tags: post?.tags || [],
    isPublished: post?.isPublished || false,
  }));

  const [slugTouched, setSlugTouched] = useState(Boolean(post?._id));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (fileInputRef.current) return () => {};
  }, []);

  const isDirty = Boolean(post?._id)
    ? JSON.stringify(formData) !== JSON.stringify({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        body: post.body || "",
        coverImage: post.coverImage || "",
        tags: post.tags || [],
        isPublished: post.isPublished || false,
      })
    : formData.title.trim() || formData.body.trim();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      if (!slugTouched && name === "title") {
        updated.slug = slugify(newValue);
      }
      return updated;
    });
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tags = tagsString
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      tags,
    }));
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setFormData((prev) => ({
      ...prev,
      slug: e.target.value,
    }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("uploading");
    setUploadProgress(0);
    setErrorMessage("");

    try {
      const asset = await uploadWithProgress({ file, onProgress: setUploadProgress });
      setFormData((prev) => ({
        ...prev,
        coverImage: asset.url,
      }));
      setUploadStatus("success");
      setTimeout(() => setUploadStatus(null), 2000);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload failed:", err);
      setErrorMessage(err.message || "Upload failed");
      setUploadStatus("error");
    }
  };

  const handleRemoveCoverImage = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: "",
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      setErrorMessage("Title and body are required");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const endpoint = post?._id ? `/api/blog/${post._id}` : "/api/blog";
      const method = post?._id ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          slug: formData.slug.trim().toLowerCase(),
          excerpt: formData.excerpt.trim(),
          body: formData.body,
          coverImage: formData.coverImage,
          tags: formData.tags,
          isPublished: formData.isPublished,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to save");
        setIsSaving(false);
        return;
      }

      onSaved(data.post);
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
          {post?._id ? "Edit Post" : "New Post"}
        </h3>
        <button
          onClick={onCancel}
          className="text-xs font-mono text-muted hover:text-highlight transition-colors"
        >
          ✕ Close
        </button>
      </div>

      <FormField
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter post title"
        maxLength={160}
      />

      <FormField
        label="Slug"
        name="slug"
        value={formData.slug}
        onChange={handleSlugChange}
        placeholder="auto-generated from title"
        hint="Auto-generated from title. Edit to customize."
      />

      <FormField
        label="Excerpt"
        name="excerpt"
        value={formData.excerpt}
        onChange={handleChange}
        placeholder="Brief summary for list views"
        maxLength={280}
      />

      <div>
        <TextareaField
          id="blog-body"
          label="Body"
          name="body"
          value={formData.body}
          onChange={handleChange}
          rows={15}
          placeholder="Enter post content. Separate paragraphs with a blank line."
          maxLength={20000}
        />
        <p className="text-xs text-muted mt-2 font-mono tracking-widest uppercase">
          Separate paragraphs with a blank line · {formData.body.length} / 20000
        </p>
      </div>

      <FormField
        label="Tags (comma-separated)"
        name="tags"
        value={formData.tags.join(", ")}
        onChange={handleTagsChange}
        placeholder="e.g. music, interview, announcement"
      />

      <div className="flex flex-col gap-3">
        <label className="font-mono text-xs tracking-widest uppercase text-muted">Cover Image</label>
        <div className="border border-dashed border-border rounded p-4 flex flex-col gap-3">
          {!formData.coverImage && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploadStatus === "uploading"}
                className="text-xs"
              />
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
          {formData.coverImage && (
            <div className="flex flex-col gap-2">
              <img
                src={formData.coverImage}
                alt="Cover preview"
                className="max-w-xs max-h-32 rounded border border-border"
              />
              <button
                onClick={handleRemoveCoverImage}
                className="text-xs font-mono text-error hover:text-error-hover transition-colors"
              >
                Remove image
              </button>
            </div>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <span className="font-mono text-sm uppercase tracking-widest">Publish immediately</span>
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
