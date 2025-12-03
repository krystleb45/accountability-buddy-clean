import type { AuthenticatedRequest } from "./authenticated-request.type.js"
import type { User } from "./mongoose.gen.js"

export type AdminRequest<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Record<string, any>,
> = Omit<AuthenticatedRequest<P, ResBody, ReqBody, ReqQuery>, "user"> & {
  user?: Partial<User>
}
