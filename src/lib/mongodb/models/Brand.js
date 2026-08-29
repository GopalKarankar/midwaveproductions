import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    logoUrl: { type: String },
    websiteUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BrandSchema.index({ isActive: 1, isFeatured: 1 });

export default mongoose.models.Brand || mongoose.model("Brand", BrandSchema);
