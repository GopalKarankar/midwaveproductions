import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/connect";
import BlogPost from "@/lib/mongodb/models/BlogPost";
import { slugify } from "@/lib/utils/slugify";
import { sanitizeRichText } from "@/lib/utils/sanitizeRichText";
import { requireRole } from "@/lib/auth/requireRole";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { withApiLog } from "@/lib/monitoring/withApiLog";
import { revalidatePath } from "next/cache";

const PUBLIC_LIST_SELECT = "title slug excerpt coverImage tags publishedAt";

export const GET = withApiLog("blog-list", async function GET(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "blog-list", limit: 30, windowMs: 60 * 1000 });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");

    const query = { isPublished: true };
    if (tag) query.tags = tag.toLowerCase();

    const posts = await BlogPost.find(query)
      .select(PUBLIC_LIST_SELECT)
      .sort({ publishedAt: -1 })
      .lean();

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("[ROUTE GET /api/blog]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const POST = withApiLog("blog-create", async function POST(request, { logMeta }) {
  const { allowed, retryAfter } = checkRateLimit(request, { routeKey: "blog-create", limit: 20, windowMs: 5 * 60 * 1000 });
  if (!allowed) {
    logMeta.rateLimited = true;
    return rateLimitResponse(retryAfter);
  }

  const { error, session, profile } = await requireRole("admin");
  if (error) return error;
  logMeta.userId = session.user.id;
  logMeta.userRoles = profile.roles ?? [];

  try {
    await dbConnect();
    const body = await request.json();

    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }

    const slug = (body.slug?.trim() || slugify(body.title)).toLowerCase();
    if (!slug) {
      return NextResponse.json({ error: "Unable to derive a slug from title" }, { status: 400 });
    }

    const isPublished = Boolean(body.isPublished);

    const post = await BlogPost.create({
      title: body.title.trim(),
      slug,
      excerpt: body.excerpt?.trim(),
      body: sanitizeRichText(body.body),
      coverImage: body.coverImage,
      tags: Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
        : [],
      isPublished,
      publishedAt: isPublished ? new Date() : undefined,
      authorId: session.user.id,
    });

    if (isPublished) {
      revalidatePath("/blog");
      revalidatePath(`/blog/${post.slug}`);
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    console.error("[ROUTE POST /api/blog]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
