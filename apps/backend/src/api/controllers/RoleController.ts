import type { NextFunction, Request, Response } from "express"

import RoleService from "../services/RoleService"
import sendResponse from "../utils/sendResponse"

export async function seedRoles(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const seeded = await RoleService.seedRoles()
    sendResponse(res, 201, true, "Roles seeded", { seeded })
  } catch (err) {
    next(err)
  }
}

export async function getAllRoles(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const roles = await RoleService.listRoles()
    sendResponse(res, 200, true, "Roles fetched", { roles })
  } catch (err) {
    next(err)
  }
}

export async function updateRole(
  req: Request<{ id: string }, unknown, { permissions: string[] }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const updated = await RoleService.updateRole(
      req.params.id,
      req.body.permissions,
    )
    sendResponse(res, 200, true, "Role updated", { role: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteRole(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await RoleService.deleteRole(req.params.id)
    sendResponse(res, 200, true, "Role deleted")
  } catch (err) {
    next(err)
  }
}
