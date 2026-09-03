import mongoose from "mongoose";

const ProblemReportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    category: {
      type: String,
      enum: ["bug", "ui_issue", "account", "booking", "payment", "other"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    pageUrl: { type: String, trim: true },
    message: { type: String, required: true, maxlength: 2000, trim: true },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "wont_fix"],
      default: "open",
      index: true,
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ProblemReport || mongoose.model("ProblemReport", ProblemReportSchema);
