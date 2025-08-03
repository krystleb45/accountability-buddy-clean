// src/types/AdminAuthenticatedRequest.ts
import type { IUser } from "../api/models/User";
import type { AuthenticatedRequest } from "./AuthenticatedRequest";

export type AdminAuthenticatedRequest<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Record<string, any>
> = Omit<AuthenticatedRequest<P, ResBody, ReqBody, ReqQuery>, "user"> & {
  user: IUser;
};
