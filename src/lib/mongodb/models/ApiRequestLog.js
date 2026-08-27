import mongoose from "mongoose";
import { ROLES } from "@/constants/roles";

const ApiRequestLogSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      index: true,
    },
    routeKey: {
      type: String,
      required: true,
      index: true,
    },
    path: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    ip: {
      type: String,
      default: "unknown",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    userRole: {
      type: String,
      enum: [...Object.values(ROLES), null],
      default: null,
    },
    rateLimited: {
      type: Boolean,
      default: false,
      index: true,
    },
    durationMs: {
      type: Number,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ApiRequestLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

export default mongoose.models.ApiRequestLog ||
  mongoose.model("ApiRequestLog", ApiRequestLogSchema);
