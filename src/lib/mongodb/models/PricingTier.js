import mongoose from "mongoose";

const PricingTierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    price: { type: String, required: true, trim: true, maxlength: 40 },
    description: { type: String, trim: true, maxlength: 200 },
    features: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PricingTierSchema.index({ order: 1 });

export default mongoose.models.PricingTier || mongoose.model("PricingTier", PricingTierSchema);
