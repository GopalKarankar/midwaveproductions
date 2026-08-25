import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLES } from "@/constants/roles";

// PATCH /api/users/[id]/role — admin only
export async function PATCH(request, { params }) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;

  try {
    const { role } = await request.json();

    if (!Object.values(ROLES).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    await dbConnect();
    const updated = await User.findByIdAndUpdate(
      id,
      { role, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE PATCH /api/users/[id]/role]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
