import mongoose from "mongoose";
import { ROLES } from "@/constants/roles";

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: String,
    picture: String,
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date, default: null },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    blockReason: { type: String, trim: true, default: null, maxlength: 500 },
    devices: [
      {
        userAgent: { type: String, required: true },
        ip: String,
        firstSeenAt: { type: Date, default: Date.now },
        lastSeenAt: { type: Date, default: Date.now },
        loginCount: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
