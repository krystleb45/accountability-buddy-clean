import type {
  BookDocument,
  BookModel,
  BookSchema as IBookSchema,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"

const BookCommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, timestamps: false },
)

const BookSchema: IBookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 150 },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    coverImage: {
      type: String,
      trim: true,
      validate: {
        validator: (url: string): boolean =>
          /^https?:\/\/.+\.(?:png|jpg|jpeg|gif|svg)$/.test(url),
        message: "Invalid cover image URL format",
      },
    },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: { type: [BookCommentSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Virtuals ---
BookSchema.virtual("likeCount").get(function (this): number {
  return this.likes.length
})
BookSchema.virtual("commentCount").get(function (this): number {
  return this.comments.length
})

// --- Instance Methods ---
BookSchema.methods = {
  async addLike(this, userId: mongoose.Types.ObjectId) {
    this.likes.addToSet(userId)
    await this.save()
    return this
  },
  async removeLike(this, userId: mongoose.Types.ObjectId) {
    this.likes.remove(userId)
    await this.save()
    return this
  },
  async addComment(this, userId: mongoose.Types.ObjectId, text: string) {
    const comment = this.comments.create({ user: userId, text })
    this.comments.push(comment)
    await this.save()
    return comment
  },
  async removeComment(this, commentId: mongoose.Types.ObjectId) {
    const idx = this.comments.findIndex((c) => c._id.equals(commentId))
    if (idx === -1) {
      return false
    }
    this.comments.splice(idx, 1)
    await this.save()
    return true
  },
}

// --- Static Methods ---
BookSchema.statics = {
  findByCategory(this, category: string, limit = 10) {
    return this.find({ category }).sort({ createdAt: -1 }).limit(limit).exec()
  },
  findRecent(this, limit = 10) {
    return this.find().sort({ createdAt: -1 }).limit(limit).exec()
  },
}

// --- Indexes ---
// Compound and single‑field indexes declared here:
BookSchema.index({ title: 1, category: 1 })
BookSchema.index({ author: 1, createdAt: -1 })
BookSchema.index({ addedBy: 1 })

// --- Model Export ---
export const Book: BookModel = mongoose.model<BookDocument, BookModel>(
  "Book",
  BookSchema,
)
