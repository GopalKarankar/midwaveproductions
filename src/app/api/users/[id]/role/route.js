import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import Artist from "@/lib/mongodb/models/Artist";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLES } from "@/constants/roles";

function generateSlug(baseName) {
  return baseName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function findUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 2;
  while (await Artist.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

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
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last remaining admin." },
          { status: 400 }
        );
      }
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { role, updatedAt: new Date() },
      { new: true }
    );

    // Auto-create Artist record if promoting to artist role
    if (role === "artist" && user.role !== "artist") {
      try {
        const existingArtist = await Artist.findOne({ ownerId: id.toString() });
        if (!existingArtist) {
          const stageName = user.name?.trim() || user.email.split("@")[0];
          const baseSlug = generateSlug(stageName);
          const slug = await findUniqueSlug(baseSlug);

          await Artist.create({
            ownerId: id.toString(),
            stageName,
            slug,
            isPublished: false,
            isFeatured: false,
          });
        }
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate key race — Artist doc already exists, swallow
        } else {
          console.error("[ROUTE PATCH /api/users/[id]/role] Artist auto-create failed", err);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE PATCH /api/users/[id]/role]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
