import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema(
  {
    socialLinks: {
      email: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      spotify: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      facebook: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    legalPages: {
      terms: { type: String, default: "" },
      privacy: { type: String, default: "" },
      about: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);
