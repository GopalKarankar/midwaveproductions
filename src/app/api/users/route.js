import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { requireRole } from "@/lib/auth/requireRole";
import { withApiLog } from "@/lib/monitoring/withApiLog";

// GET /api/users — admin only
export const GET = withApiLog("users-list", async function GET(request, { logMeta }) {
  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  try {
    await dbConnect();
    const users = await User.find()
      .select("email name picture roles createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[ROUTE GET /api/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
