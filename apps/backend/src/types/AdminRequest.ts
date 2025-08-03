// types/AdminRequest.ts
import type { IUser } from "../api/models/User"; // adjust the path as needed
import type { AuthenticatedRequest } from "./AuthenticatedRequest";

export type AdminRequest<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Record<string, any>
> = Omit<AuthenticatedRequest<P, ResBody, ReqBody, ReqQuery>, "user"> & {
  user?: Partial<IUser>;
};
