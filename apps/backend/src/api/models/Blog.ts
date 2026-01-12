import mongoose, { Schema } from "mongoose"

import type { Document, Model } from "mongoose"

export interface IBlogComment {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  text: string
  createdAt: Date
}

export interface IBlog extends Document {
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  author: mongoose.Types.ObjectId
  status: "draft" | "published"
  tags: string[]
  likes: mongoose.Types.ObjectId[]
  comments: IBlogComment[]
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  likeCount: number
  commentCount: number
}

const BlogCommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, timestamps: false }
)

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
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
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: { type: [BlogCommentSchema], default: [] },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Virtuals
BlogSchema.virtual("likeCount").get(function () {
  return this.likes?.length || 0
})

BlogSchema.virtual("commentCount").get(function () {
  return this.comments?.length || 0
})

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