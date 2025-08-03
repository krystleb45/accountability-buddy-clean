import type { NextFunction, Request, Response } from "express";

import SessionService from "../services/SessionService";

export async function login (req: Request,  res: Response,  next: NextFunction): Promise<void> {
  const { email, password } = req.body;
  try {
    const { token, session } = await SessionService.login(email, password, req);
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      sessionId: session._id,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function logout (req: Request,  res: Response,  next: NextFunction): Promise<void> {
  try {
    const sessionId = req.session.id;
    await SessionService.logout(sessionId);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    next(err);
  }
}

export async function deleteAllSessions (req: Request,  res: Response,  next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const sessionId = req.session.id;
    await SessionService.deleteAllExcept(userId, sessionId);
    res
      .status(200)
      .json({ success: true, message: "Other sessions invalidated" });
  } catch (err: any) {
    next(err);
  }
}

export async function refreshSession (req: Request,  res: Response,  next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const token = await SessionService.refresh(userId);
    res.status(200).json({
      success: true,
      message: "Session refreshed successfully",
      token,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function getSession (req: Request<{ sessionId: string }>,  res: Response,  next: NextFunction): Promise<void> {
  try {
    const { sessionId } = req.params;
    const session = await SessionService.getById(sessionId);
    res.status(200).json({
      success: true,
      message: "Session retrieved successfully",
      data: session,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function getUserSessions (req: Request,  res: Response,  next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const sessions = await SessionService.listForUser(userId);
    res.status(200).json({ success: true, data: sessions });
  } catch (err: any) {
    next(err);
  }
}

export async function deleteSession (req: Request<{ sessionId: string }>,  res: Response,  next: NextFunction): Promise<void> {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;
    await SessionService.delete(sessionId, userId);
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (err: any) {
    next(err);
  }
}
