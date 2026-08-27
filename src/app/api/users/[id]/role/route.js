import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import Artist from "@/lib/mongodb/models/Artist";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLES } from "@/constants/roles";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";

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
export const PATCH = withApiLog("users-role", async function PATCH(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, {
    routeKey: 'users-role',
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
    const { roles } = await request.json();

    if (!Array.isArray(roles) || roles.length === 0 || !roles.every((r) => Object.values(ROLES).includes(r))) {
      return NextResponse.json({ error: "Invalid roles" }, { status: 400 });
    }
    await dbConnect();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.roles.includes("admin") && !roles.includes("admin")) {
      const adminCount = await User.countDocuments({ roles: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last remaining admin." },
          { status: 400 }
        );
      }
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { roles, updatedAt: new Date() },
      { new: true }
    );

    // Auto-create Artist record if promoting to artist role
    if (roles.includes("artist") && !user.roles.includes("artist")) {
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
});
