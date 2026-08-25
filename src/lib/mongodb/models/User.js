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
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
