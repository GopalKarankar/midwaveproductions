import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLES } from "@/constants/roles";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function PATCH(request, { params }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'users-status',
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) return rateLimitResponse(retryAfter);

  const { error, session } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;

  try {
    const { isBlocked, reason } = await request.json();

    if (typeof isBlocked !== "boolean") {
      return NextResponse.json({ error: "isBlocked must be a boolean" }, { status: 400 });
    }

    if (reason !== undefined && typeof reason !== "string") {
      return NextResponse.json({ error: "reason must be a string" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent blocking your own account
    if (id === session.user.id) {
      return NextResponse.json({ error: "You cannot block your own account." }, { status: 400 });
    }

    // Prevent blocking the last remaining admin
    if (user.role === "admin" && isBlocked === true) {
      const unblocked_admin_count = await User.countDocuments({ role: "admin", isBlocked: false });
      if (unblocked_admin_count <= 1) {
        return NextResponse.json(
          { error: "Cannot block the last remaining admin." },
          { status: 400 }
        );
      }
    }

    const update = { isBlocked, updatedAt: new Date() };
    if (isBlocked) {
      update.blockedAt = new Date();
      update.blockedBy = session.user.id;
      update.blockReason = reason?.trim() || null;
    }

    const updated = await User.findByIdAndUpdate(id, update, { new: true }).populate("blockedBy", "email name");

    return NextResponse.json({
      success: true,
      isBlocked: updated.isBlocked,
      blockedAt: updated.blockedAt,
      blockedBy: updated.blockedBy,
      blockReason: updated.blockReason,
    });
  } catch (err) {
    console.error("[ROUTE PATCH /api/users/[id]/status]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
