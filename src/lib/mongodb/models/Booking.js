import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true, index: true },
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true },
    requesterPhone: { type: String },
    organization: { type: String },
    eventType: {
      type: String,
      enum: ["concert", "festival", "private_event", "corporate", "collaboration", "other"],
      required: true,
    },
    eventDate: { type: Date },
    eventLocation: { type: String },
    budget: { type: String },
    message: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "reviewing", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
