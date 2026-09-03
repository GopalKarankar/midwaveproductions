import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    category: {
      type: String,
      enum: ["general", "feature_request", "praise", "other"],
      default: "general",
    },
    rating: { type: Number, min: 1, max: 5 },
    message: { type: String, required: true, maxlength: 2000, trim: true },
    status: {
      type: String,
      enum: ["new", "reviewed", "archived"],
      default: "new",
      index: true,
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
