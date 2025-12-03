import mongoose, { Schema } from "mongoose"

import type {
  AccountabilityPartnershipDocument,
  AccountabilityPartnershipModel,
  AccountabilityPartnershipSchema as IAccountabilityPartnershipSchema,
} from "../../types/mongoose.gen.js"

const AccountabilityPartnershipSchema: IAccountabilityPartnershipSchema =
  new Schema(
    {
      user1: { type: Schema.Types.ObjectId, ref: "User", required: true },
      user2: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    {
      timestamps: true,
    },
  )

AccountabilityPartnershipSchema.statics = {
  findBetweenUsers(this, u1: string, u2: string) {
    const id1 = new mongoose.Types.ObjectId(u1)
    const id2 = new mongoose.Types.ObjectId(u2)
    return this.findOne({
      $or: [
        { user1: id1, user2: id2 },
        { user1: id2, user2: id1 },
      ],
    }).exec()
  },
}

export const AccountabilityPartnership: AccountabilityPartnershipModel =
  mongoose.model<
    AccountabilityPartnershipDocument,
    AccountabilityPartnershipModel
  >("AccountabilityPartnership", AccountabilityPartnershipSchema)
