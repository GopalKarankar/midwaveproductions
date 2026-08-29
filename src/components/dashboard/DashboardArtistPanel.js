"use client";

import { useState } from "react";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FormField } from "@/components/ui/FormField";
import { TextareaField } from "@/components/ui/TextareaField";
import { RichTextField } from "@/components/ui/RichTextField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";

export function DashboardArtistPanel({ artist, userId, sectionNumber = "1" }) {
  const [formData, setFormData] = useState(
    artist || {
      stageName: "",
      bio: "",
      shortBio: "",
      genres: [],
      socialLinks: {},
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      genres: value ? value.split(",").map((g) => g.trim()) : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/artists/${artist?._id || ""}`, {
        method: artist ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save");
      }

      setMessage("Profile saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-8 py-12 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <SectionNumber n={sectionNumber} />
        <SectionHeading className="!text-3xl">Artist Profile</SectionHeading>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormField
          label="Stage Name"
          name="stageName"
          value={formData.stageName}
          onChange={handleChange}
          placeholder="Your artist name"
        />

        <RichTextField
          label="Bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Full biography with formatting (up to 2000 chars)"
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

        <FormField
          label="Genres (comma-separated)"
          name="genres"
          value={formData.genres?.join(", ") || ""}
          onChange={handleGenresChange}
          placeholder="e.g., Electronic, Hip-Hop, Ambient"
        />

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
              />
            )
          )}
        </div>

        {message && (
          <div
            className={`text-sm font-mono tracking-widest uppercase ${
              message.includes("Error") ? "text-error" : "text-success"
            }`}
          >
            {message}
          </div>
        )}

        <Button type="submit" variant="solid" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
