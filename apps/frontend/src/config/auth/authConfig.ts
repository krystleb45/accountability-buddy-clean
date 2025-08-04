// src/config/auth/authConfig.ts

// Storage keys
const TOKEN_KEY = "authToken"
const REFRESH_TOKEN_KEY = "refreshToken"
const EXPIRY_KEY = "tokenExpiry"

// OAuth providers (using NEXT_PUBLIC_ for client‐side env)
const OAUTH_PROVIDERS = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || "",
    scope: "profile email",
    responseType: "token",
  },
  facebook: {
    clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || "",
    redirectUri: process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI || "",
    scope: "public_profile email",
    responseType: "token",
  },
} as const

export interface AuthProviderConfig {
  clientId: string
  redirectUri: string
  scope: string
  responseType: string
}

export interface AuthConfig {
  tokenKey: string
  refreshTokenKey: string
  tokenExpiryKey: string

  loginRedirect: string
  logoutRedirect: string

  getToken: () => string | null
  setToken: (token: string) => void
  removeToken: () => void

  getRefreshToken: () => string | null
  setRefreshToken: (token: string) => void
  removeRefreshToken: () => void

  getTokenExpiry: () => number | null
  setTokenExpiry: (expiry: number) => void
  isTokenExpired: () => boolean

  clearAuthData: () => void

  authProviders: Record<"google" | "facebook", AuthProviderConfig>
  isAuthProviderConfigured: (provider: keyof typeof OAUTH_PROVIDERS) => boolean
}

const authConfig: AuthConfig = {
  // keys
  tokenKey: TOKEN_KEY,
  refreshTokenKey: REFRESH_TOKEN_KEY,
  tokenExpiryKey: EXPIRY_KEY,

  // redirects
  loginRedirect: "/dashboard",
  logoutRedirect: "/login",

  // token handlers
  getToken: () => {
    return typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null
  },
  setToken: (token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token)
    }
  },
  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY)
    }
  },

  // refresh token handlers
  getRefreshToken: () => {
    return typeof window !== "undefined"
      ? localStorage.getItem(REFRESH_TOKEN_KEY)
      : null
  },
  setRefreshToken: (token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    }
  },
  removeRefreshToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  },

  // expiry handlers
  getTokenExpiry: () => {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem(EXPIRY_KEY)
    return raw ? Number.parseInt(raw, 10) : null
  },
  setTokenExpiry: (expiry) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(EXPIRY_KEY, expiry.toString())
    }
  },
  isTokenExpired: () => {
    const exp = authConfig.getTokenExpiry()
    return exp !== null && Date.now() >= exp
  },

  // clear all auth data
  clearAuthData: () => {
    authConfig.removeToken()
    authConfig.removeRefreshToken()
    if (typeof window !== "undefined") {
      localStorage.removeItem(EXPIRY_KEY)
    }
  },

  // OAuth providers
  authProviders: OAUTH_PROVIDERS,
  isAuthProviderConfigured: (provider) => {
    const cfg = OAUTH_PROVIDERS[provider]
    return Boolean(cfg.clientId && cfg.redirectUri)
  },
}

export default authConfig
