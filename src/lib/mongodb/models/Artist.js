import mongoose from "mongoose";

const ArtistSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    stageName: { type: String, required: true, trim: true },
    realName: { type: String },
    bio: { type: String, maxlength: 2000 },
    shortBio: { type: String, maxlength: 280 },
    genres: [{ type: String, trim: true }],
    socialLinks: {
      instagram: String,
      spotify: String,
      youtube: String,
      soundcloud: String,
      twitter: String,
      website: String,
    },
    profileImage: { type: String },
    coverImage: { type: String },
    pressKit: { type: String },
    featuredTracks: [
      {
        title: String,
        url: String,
        platform: { type: String, enum: ["spotify", "soundcloud", "youtube", "other"] },
      },
    ],
    upcomingEvents: [
      {
        title: String,
        date: Date,
        venue: String,
        city: String,
        ticketUrl: String,
      },
    ],
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Artist || mongoose.model("Artist", ArtistSchema);
