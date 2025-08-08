// NextAuth.js type extensions
import type { DefaultSession, DefaultUser } from "next-auth"
import type { JWT as DefaultJWT } from "next-auth/jwt"

import type { Role } from "./auth.types"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string
      role: Role
      accessToken: string | null
    }
  }

  interface User extends DefaultUser {
    id: string
    role: Role
    accessToken: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: Role
    accessToken: string | null
  }
}
