import type { AuthenticatedRequest } from "./authenticated-request.type"
import type { User } from "./mongoose.gen"

export type AdminAuthenticatedRequest<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Record<string, any>,
> = Omit<AuthenticatedRequest<P, ResBody, ReqBody, ReqQuery>, "user"> & {
  user: User
}
