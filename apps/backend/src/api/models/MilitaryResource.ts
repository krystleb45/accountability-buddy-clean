import type {
  ExternalSupportResourceDocument,
  ExternalSupportResourceModel,
  ExternalSupportResourceSchema as IExternalSupportResourceSchema,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"

// --- Category Union ---
export type ResourceCategory =
  | "hotline"
  | "website"
  | "forum"
  | "organization"
  | "other"

// --- Schema Definition ---
const ExternalSupportResourceSchema: IExternalSupportResourceSchema =
  new Schema(
    {
      title: {
        type: String,
        required: [true, "Resource title is required."],
        trim: true,
        minlength: [3, "Title must be at least 3 characters long."],
        maxlength: [200, "Title cannot exceed 200 characters."],
      },
      url: {
        type: String,
        required: [true, "URL is required."],
        trim: true,
        match: [
          /^(https?:\/\/)?([\w-]+\.)+\w{2,}(\/.*)?$/,
          "Please provide a valid URL.",
        ],
      },
      description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters."],
      },
      category: {
        type: String,
        enum: ["hotline", "website", "forum", "organization", "other"],
        default: "other",
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    },
  )

ExternalSupportResourceSchema.index({ title: "text", url: 1 })

// --- Virtuals ---
ExternalSupportResourceSchema.virtual("domain").get(function (this) {
  try {
    const u = new URL(this.url)
    return u.hostname
  } catch {
    return ""
  }
})

// --- Instance Methods ---
ExternalSupportResourceSchema.methods = {
  async deactivate(this) {
    this.isActive = false
    await this.save()
    return this
  },
  async activate(this) {
    this.isActive = true
    await this.save()
    return this
  },
}

// --- Static Methods ---
ExternalSupportResourceSchema.statics = {
  findByCategory(this, category: ResourceCategory) {
    return this.find({ category, isActive: true }).sort({ title: 1 }).exec()
  },
  searchByTitle(this, text: string) {
    return this.find(
      { $text: { $search: text }, isActive: true },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .exec()
  },
}

export const ExternalSupportResource: ExternalSupportResourceModel =
  mongoose.model<ExternalSupportResourceDocument, ExternalSupportResourceModel>(
    "ExternalSupportResource",
    ExternalSupportResourceSchema,
  )
