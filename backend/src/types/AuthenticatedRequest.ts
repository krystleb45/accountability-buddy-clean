// backend/src/types/AuthenticatedRequest.ts
import { Request } from "express";
import { IUser } from "./AuthenticatedUser";

// Generic interface that allows typing params
export interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any>
  extends Omit<Request<P, ResBody, ReqBody, ReqQuery>, "user"> {
    user?: Partial<IUser>;
    params: P; // Properly typed params
}

// Specific interfaces for common param patterns
export interface AuthenticatedRequestWithUserId extends AuthenticatedRequest<{ userId: string }> {}

export interface AuthenticatedRequestWithTaskId extends AuthenticatedRequest<{ taskId: string }> {}

export interface AuthenticatedRequestWithGoalId extends AuthenticatedRequest<{ goalId: string }> {}

export interface AnalyticsRequestBody {
  startDate: string;
  endDate: string;
  metric: string;
}