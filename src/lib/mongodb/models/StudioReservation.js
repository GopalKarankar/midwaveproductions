import mongoose from "mongoose";

const StudioReservationSchema = new mongoose.Schema(
  {
    requesterName: { type: String, required: true, trim: true },
    requesterEmail: { type: String, required: true, trim: true, lowercase: true },
    requesterPhone: { type: String, trim: true },
    preferredDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    durationHours: { type: Number, required: true, min: 1, max: 12 },
    purpose: {
      type: String,
      enum: ["recording", "mixing", "mastering", "rehearsal", "podcast", "other"],
      required: true,
    },
    message: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.StudioReservation || mongoose.model("StudioReservation", StudioReservationSchema);
