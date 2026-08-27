import { cache } from "react";
import dbConnect from "@/lib/mongodb/connect";
import BlogPost from "@/lib/mongodb/models/BlogPost";

export const getPublishedPostBySlug = cache(async function getPublishedPostBySlug(slug) {
  await dbConnect();
  return BlogPost.findOne({ slug, isPublished: true }).lean();
});
