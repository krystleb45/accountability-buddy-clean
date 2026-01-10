import mongoose, { Schema } from "mongoose"

import type { Document, Model } from "mongoose"

export interface IBlog extends Document {
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  author: mongoose.Types.ObjectId
  status: "draft" | "published"
  tags: string[]
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    coverImage: { type: String },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    tags: [{ type: String, trim: true }],
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Auto-generate slug from title
BlogSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  
  next()
})

BlogSchema.index({ slug: 1 })
BlogSchema.index({ status: 1 })
BlogSchema.index({ publishedAt: -1 })
BlogSchema.index({ tags: 1 })

export const Blog: Model<IBlog> = mongoose.model<IBlog>("Blog", BlogSchema)