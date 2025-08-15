/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend = (
      process.env.BACKEND_URL || "http://localhost:5050"
    ).replace(/\/$/, "")
    return {
      // Ensure backend auth endpoints override local Next route handlers
      // by checking these before filesystem routes.
      beforeFiles: [
        {
          source: "/api/auth/register",
          destination: `${backend}/api/auth/register`,
        },
        {
          source: "/api/auth/login",
          destination: `${backend}/api/auth/login`,
        },
        {
          source: "/api/auth/me",
          destination: `${backend}/api/auth/me`,
        },
        {
          source: "/api/auth/send-verification-email",
          destination: `${backend}/api/auth/send-verification-email`,
        },
        {
          source: "/api/auth/verify-email",
          destination: `${backend}/api/auth/verify-email`,
        },
        {
          source: "/api/auth/forget-password",
          destination: `${backend}/api/auth/forget-password`,
        },
        {
          source: "/api/auth/reset-password",
          destination: `${backend}/api/auth/reset-password`,
        },
      ],
      // If nothing matched (including dynamic routes like [...nextauth]),
      // proxy remaining /api/* requests to the backend
      fallback: [
        {
          source: "/api/:path*",
          destination: `${backend}/api/:path*`,
        },
      ],
    }
  },
}

module.exports = nextConfig
