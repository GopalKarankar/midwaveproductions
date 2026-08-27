import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true, maxlength: 280 },
    body: { type: String, required: true, maxlength: 20000 },
    coverImage: { type: String },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

BlogPostSchema.index({ isPublished: 1, publishedAt: -1 });
BlogPostSchema.index({ tags: 1 });

export default mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
