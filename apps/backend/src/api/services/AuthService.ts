import type { JwtPayload, SignOptions } from "jsonwebtoken"
import type { StringValue } from "ms"

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import { logger } from "../../utils/winston-logger.js"
import Role from "../models/Role.js"

interface TokenPayload {
  userId: string
  role: string
}

const {
  ACCESS_TOKEN_SECRET,
  SALT_ROUNDS = "12",
  ACCESS_TOKEN_EXPIRES_IN = "7d", // Changed from "1h" to "7d" for better UX
} = process.env

if (!ACCESS_TOKEN_SECRET) {
  logger.error("ACCESS_TOKEN_SECRET must be defined in .env")
  throw new Error("Missing ACCESS_TOKEN_SECRET")
}

const AuthService = {
  async hashPassword(password: string): Promise<string> {
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.")
    }
    const rounds = Number.parseInt(SALT_ROUNDS, 10)
    return bcrypt.hash(password, rounds)
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  },

  async generateToken(user: { _id: string; role: string }): Promise<string> {
    const roleRecord = await Role.findOne({ roleName: user.role })
    if (!roleRecord) {
      logger.error(`Invalid role: ${user.role}`)
      throw new Error(`Invalid role: ${user.role}`)
    }

    const payload: TokenPayload = {
      userId: user._id,
      role: user.role,
    }

    const opts: SignOptions = {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN as unknown as StringValue,
    }

    return jwt.sign(payload, ACCESS_TOKEN_SECRET, opts)
  },

  async verifyToken(token: string) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload
    } catch (err) {
      logger.error(`JWT verification failed: ${(err as Error).message}`)
      throw new Error("Token verification failed.")
    }
  },

  async refreshToken(oldToken: string): Promise<string> {
    let decoded: JwtPayload
    try {
      decoded = jwt.verify(oldToken, ACCESS_TOKEN_SECRET, {
        ignoreExpiration: true,
      }) as JwtPayload
    } catch (err) {
      logger.error(`Refresh token decode failed: ${(err as Error).message}`)
      throw new Error("Token refresh failed.")
    }
    const { userId, role } = decoded as unknown as TokenPayload
    if (!userId || !role) {
      throw new Error("Invalid token payload.")
    }
    return this.generateToken({ _id: userId, role })
  },
}

export default AuthService