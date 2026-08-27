import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

export const DELETE = withApiLog("users-delete", async function DELETE(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'users-delete',
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  const { id } = await params;

  try {
    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent acting on your own account
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    // Prevent deleting the last remaining admin
    if (user.roles.includes("admin")) {
      const adminCount = await User.countDocuments({ roles: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last remaining admin." },
          { status: 400 }
        );
      }
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE DELETE /api/users/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
