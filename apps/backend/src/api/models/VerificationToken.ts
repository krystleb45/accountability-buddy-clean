import type { Types } from "mongoose"
import type {
  VerificationTokenSchema as IVerificationTokenSchema,
  VerificationTokenDocument,
  VerificationTokenModel,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"
import crypto from "node:crypto"

// --- Schema definition ---
const VerificationTokenSchema: IVerificationTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  },
)

// — TTL index so Mongo will auto-delete expired docs —
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// — For fast lookups by user if you ever need it —
VerificationTokenSchema.index({ user: 1 })

// — And by token string for quick findValid() —
VerificationTokenSchema.index({ token: 1 })

// --- Instance method implementation ---
VerificationTokenSchema.methods.isExpired = function (this): boolean {
  return this.expiresAt.getTime() <= Date.now()
}

// --- Static method: generate a new token ---
VerificationTokenSchema.statics.generate = async function (
  this,
  userId: Types.ObjectId,
  expiresInSeconds = 24 * 60 * 60,
): Promise<VerificationTokenDocument> {
  const tokenString = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)

  const doc = new this({ user: userId, token: tokenString, expiresAt })
  await doc.save()
  return doc
}

// --- Static method: find only non‐expired token docs ---
VerificationTokenSchema.statics.findValid = async function (
  this,
  token: string,
) {
  const doc = await this.findOne({ token })
  if (!doc || doc.isExpired()) {
    return null
  }
  return doc
}

// --- Export the model ---
export const VerificationToken: VerificationTokenModel = mongoose.model<
  VerificationTokenDocument,
  VerificationTokenModel
>("VerificationToken", VerificationTokenSchema)
