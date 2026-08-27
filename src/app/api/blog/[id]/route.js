import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import BlogPost from "@/lib/mongodb/models/BlogPost";
import MediaAsset from "@/lib/mongodb/models/MediaAsset";
import { requireRole } from "@/lib/auth/requireRole";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";
import { revalidatePath } from "next/cache";

const PUBLIC_SELECT = "title slug excerpt body coverImage tags publishedAt";
const EDITABLE_FIELDS = ["title", "slug", "excerpt", "body", "coverImage", "tags", "isPublished"];

export const GET = withApiLog("blog-detail", async function GET(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "blog-detail", limit: 30, windowMs: 60 * 1000 });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  const { id } = await params;
  try {
    await dbConnect();
    const post = await BlogPost.findById(id).select(PUBLIC_SELECT).lean();
    if (!post || !post.isPublished) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err) {
    console.error("[ROUTE GET /api/blog/[id]]", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
});

export const PATCH = withApiLog("blog-update", async function PATCH(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "blog-update", limit: 20, windowMs: 5 * 60 * 1000 });
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
    const post = await BlogPost.findById(id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const update = {};
    for (const field of EDITABLE_FIELDS) {
      if (!(field in body)) continue;
      if (field === "slug") update.slug = String(body.slug).trim().toLowerCase();
      else if (field === "tags")
        update.tags = Array.isArray(body.tags)
          ? body.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
          : [];
      else update[field] = body[field];
    }

    const wasPublished = post.isPublished;
    if (update.isPublished === true && !wasPublished && !post.publishedAt) {
      update.publishedAt = new Date();
    }

    const oldSlug = post.slug;
    const updated = await BlogPost.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select(PUBLIC_SELECT + " isPublished");

    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);
    if (oldSlug !== updated.slug) revalidatePath(`/blog/${oldSlug}`);

    return NextResponse.json({ post: updated });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    console.error("[ROUTE PATCH /api/blog/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const DELETE = withApiLog("blog-delete", async function DELETE(request, { params, logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "blog-delete", limit: 20, windowMs: 5 * 60 * 1000 });
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
    const post = await BlogPost.findById(id);
    if (!post) return NextResponse.json({ error: "Blog post not found" }, { status: 404 });

    if (post.coverImage) {
      const asset = await MediaAsset.findOne({ url: post.coverImage });
      if (asset) {
        const supabaseAdmin = createAdminClient();
        const { error: deleteError } = await supabaseAdmin.storage.from("media").remove([asset.storagePath]);
        if (deleteError) {
          console.error("[ROUTE DELETE /api/blog/[id]] storage delete failed", deleteError);
          return NextResponse.json({ error: "Failed to delete cover image from storage" }, { status: 500 });
        }
        await MediaAsset.findByIdAndDelete(asset._id);
      }
    }

    await BlogPost.findByIdAndDelete(id);
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ROUTE DELETE /api/blog/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
