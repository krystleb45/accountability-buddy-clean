import type { NextFunction, Request, Response } from "express"

import { CustomError } from "./errorHandler"

interface AnonymousUser {
  sessionId: string
  displayName?: string
  room: string
  joinedAt: Date
}

interface AnonymousRequest extends Request {
  anonymousUser?: AnonymousUser
}

export function anonymousAuth(
  req: AnonymousRequest,
  res: Response,
  next: NextFunction,
): void {
  const sessionId = req.headers["x-anonymous-session"] as string
  const displayName = req.headers["x-anonymous-name"] as string

  if (!sessionId) {
    next(new CustomError("Anonymous session ID is required", 400))
    return
  }

  // Validate session format
  if (!sessionId.startsWith("anon_") || sessionId.length < 20) {
    next(new CustomError("Invalid anonymous session ID format", 400))
    return
  }

  req.anonymousUser = {
    sessionId,
    displayName,
    room: req.params.roomId || "",
    joinedAt: new Date(),
  }

  next()
}
