"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";

export function ProfileForm({ initialName, initialPicture, email, roles }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialName,
    picture: initialPicture,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          picture: formData.picture,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save");
      }

      setMessage("Profile saved successfully!");
      setTimeout(() => setMessage(""), 3000);
      router.refresh();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex flex-wrap gap-2">
        <Badge variant="blue">{email}</Badge>
        {roles?.map((role) => (
          <Badge key={role} variant="yellow">
            {role}
          </Badge>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
        />

        <FormField
          label="Picture URL"
          name="picture"
          value={formData.picture}
          onChange={handleChange}
          placeholder="URL to your avatar (optional)"
        />

        {message && (
          <div
            className={`text-sm font-mono tracking-widest uppercase ${
              message.includes("Error") ? "text-error" : "text-success"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-block font-mono text-xs px-4 py-2 uppercase tracking-widest border transition-colors duration-300 ease-brand bg-accent text-bg border-accent hover:bg-accent-hover hover:border-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
