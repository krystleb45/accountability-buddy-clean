// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,

  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },

  compiler: {
    styledComponents: {
      ssr: true,
      displayName: true,
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname:
          (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050')
            .replace(/^https?:\/\//, '')
            .replace(/\/api$/, ''),
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async rewrites() {
  const backend = (process.env.BACKEND_URL || 'http://localhost:5050').replace(/\/$/, '');
  return [
    // 1) Let NextAuth handle /api/auth/* locally
    {
      source: '/api/auth/:path*',
      destination: '/api/auth/:path*',
    },
    // 2) Let Next.js handle groups API routes locally
    {
      source: '/api/groups/:path*',
      destination: '/api/groups/:path*',
    },
    // 3) Let Next.js handle other local API routes (add as needed)
    {
      source: '/api/test-static',
      destination: '/api/test-static',
    },
    {
      source: '/api/test-dynamic/:path*',
      destination: '/api/test-dynamic/:path*',
    },
    // 4) Proxy remaining /api/* calls to the Express backend
    {
      source: '/api/:path*',
      destination: `${backend}/api/:path*`,
    },
    // 5) Proxy uploads (serve static files from Express)
    {
      source: '/uploads/:path*',
      destination: `${backend}/uploads/:path*`,
    },
  ];
},

  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // SVGR support for importing SVGs as React components
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [{ loader: '@svgr/webpack', options: { icon: true } }],
    });

    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)\\.(js|css|svg|png|jpg|jpeg|webp|avif)$',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src *",
            ].join('; '),
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/old-route',
        destination: '/landing',
        permanent: true,
      },
    ];
  },

  trailingSlash: false,
};

module.exports = nextConfig;
