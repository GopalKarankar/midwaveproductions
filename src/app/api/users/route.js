import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { requireRole } from "@/lib/auth/requireRole";

// GET /api/users — admin only
export async function GET() {
  const { error } = await requireRole("admin");
  if (error) return error;

  try {
    await dbConnect();
    const users = await User.find()
      .select("email name picture role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[ROUTE GET /api/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
