import type { NextAuthOptions, User } from "next-auth"

import axios from "axios"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const runtime = "nodejs"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET")
}
if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  throw new Error("Missing NEXT_PUBLIC_BACKEND_URL")
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null
        }

        // console.log("🔍 [NEXTAUTH] Attempting login for:", credentials.email)

        try {
          const res = await axios.post<{ data: { user: User } }>(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
          )

          // console.log(
          //   "🔍 [NEXTAUTH] Backend login response status:",
          //   res.status,
          // )

          const payload = res.data

          // console.log(
          //   "🔍 [NEXTAUTH] Backend login payload keys:",
          //   Object.keys(payload),
          // )
          // console.log(
          //   "🔍 [NEXTAUTH] Payload structure:",
          //   JSON.stringify(payload, null, 2),
          // )

          // Handle different possible response formats
          const userData = {
            id: payload.data.user.id,
            name: payload.data.user.name ?? null,
            email: payload.data.user.email ?? null,
            role: payload.data.user.role,
            accessToken: payload.data.user.accessToken,
          }

          // console.log("🔍 [NEXTAUTH] Extracted user data:", {
          //   id: userData.id,
          //   name: userData.name,
          //   email: userData.email,
          //   role: userData.role,
          //   hasAccessToken: !!userData.accessToken,
          //   tokenPreview: userData.accessToken
          //     ? `${userData.accessToken.substring(0, 20)}...`
          //     : "none",
          // })

          // Validate required fields
          if (!userData.id || !userData.accessToken) {
            // console.log("❌ [NEXTAUTH] Missing required fields")
            // console.log("🔍 [NEXTAUTH] Has ID:", !!userData.id)
            // console.log(
            //   "🔍 [NEXTAUTH] Has accessToken:",
            //   !!userData.accessToken,
            // )
            return null
          }

          // console.log(
          //   "✅ [NEXTAUTH] Login successful, returning user with token",
          // )
          return userData
        } catch (error) {
          console.error("❌ [NEXTAUTH] Login error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.accessToken = user.accessToken || null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.accessToken = token.accessToken || null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
