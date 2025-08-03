// src/api/middleware/anonymousAuth.ts

import type { NextFunction, Request, Response } from "express";

interface AnonymousUser {
  sessionId: string;
  displayName: string;
  room: string;
  joinedAt: Date;
}

interface AnonymousRequest extends Request {
  anonymousUser?: AnonymousUser;
}

export function anonymousAuth (req: AnonymousRequest, res: Response, next: NextFunction): void {
  const sessionId = req.headers["x-anonymous-session"] as string;
  const displayName = req.headers["x-anonymous-name"] as string;

  if (!sessionId || !displayName) {
    res.status(400).json({
      success: false,
      error: "Anonymous session ID and display name required"
    });
    return; // Add explicit return
  }

  // Validate session format
  if (!sessionId.startsWith("anon_") || sessionId.length < 20) {
    res.status(400).json({
      success: false,
      error: "Invalid session ID format"
    });
    return; // Add explicit return
  }

  req.anonymousUser = {
    sessionId,
    displayName,
    room: req.params.roomId || "",
    joinedAt: new Date()
  };

  next();
   // Add explicit return (optional but good practice)
}
