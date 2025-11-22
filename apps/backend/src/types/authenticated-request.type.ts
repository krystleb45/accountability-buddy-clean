import type { Request } from "express"

import type { User } from "./mongoose.gen"

// Generic interface that allows typing params
export interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> extends Omit<Request<P, ResBody, ReqBody, ReqQuery>, "user"> {
  user: Omit<User, "subscription_status" | "password"> & {
    subscription_status?: Exclude<
      User["subscription_status"],
      "canceled" | "past_due"
    >
    id: string
  }
  params: P // Properly typed params
}
