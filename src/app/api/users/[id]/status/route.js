import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLES } from "@/constants/roles";

export async function PATCH(request, { params }) {
  const { error, session } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;

  try {
    const { isBlocked } = await request.json();

    if (typeof isBlocked !== "boolean") {
      return NextResponse.json({ error: "isBlocked must be a boolean" }, { status: 400 });
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

    const updated = await User.findByIdAndUpdate(
      id,
      { isBlocked, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE PATCH /api/users/[id]/status]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
