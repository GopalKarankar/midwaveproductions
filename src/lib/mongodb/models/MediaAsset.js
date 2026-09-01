import mongoose from "mongoose";

const MediaAssetSchema = new mongoose.Schema(
  {
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
    uploadedBy: { type: String, required: true },
    type: { type: String, enum: ["image", "audio", "video", "document"], required: true },
    source: { type: String, enum: ["upload", "youtube"], default: "upload" },
    url: { type: String, required: true },
    storagePath: {
      type: String,
      required: function() { return this.source !== "youtube"; },
    },
    youtubeVideoId: { type: String },
    filename: { type: String },
    size: { type: Number },
    mimeType: { type: String },
    label: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.MediaAsset || mongoose.model("MediaAsset", MediaAssetSchema);
