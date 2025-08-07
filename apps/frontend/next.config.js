/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend = (
      process.env.BACKEND_URL || "http://localhost:5050"
    ).replace(/\/$/, "")
    return [
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*",
      },
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
