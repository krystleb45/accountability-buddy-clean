// src/config/security/securityConfig.ts

// Define the exact HTTP header names we’ll set
interface SecurityHeaders {
  "Content-Security-Policy": string
  "X-Frame-Options": string
  "Strict-Transport-Security": string
  "X-Content-Type-Options": string
  "Referrer-Policy": string
  "Permissions-Policy": string
}

interface SecurityConfig {
  headers: SecurityHeaders

  /**
   * Apply the security headers to any response-like object
   * that has a `setHeader(name, value)` method.
   */
  applyHeaders: (response: {
    setHeader: (name: string, value: string) => void
  }) => void

  logConfig: () => void
}

const securityConfig: SecurityConfig = {
  headers: {
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none';",
    "X-Frame-Options": "SAMEORIGIN",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "geolocation=(), microphone=(), camera=(), payment=(), fullscreen=*",
  },

  applyHeaders(response) {
    for (const [name, value] of Object.entries(this.headers) as Array<
      [keyof SecurityHeaders, string]
    >) {
      response.setHeader(name, value)
    }
  },

  logConfig() {
    console.log("Current Security Headers:", this.headers)
  },
}

export default securityConfig
