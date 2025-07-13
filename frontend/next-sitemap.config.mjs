/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://accountabilitybuddys.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 10000,
  // Exclude private, admin, dashboard, auth (including NEXTAUTH callback routes)
  exclude: [
    '/private/*',
    '/admin/*',
    '/dashboard/*',
    '/auth/*',
    '/api/*',
    '/_next/*',
  ],
  trailingSlash: false, // or true if you prefer /about/ over /about
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/private/', '/admin/', '/dashboard/', '/auth/'] },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://accountabilitybuddys.com'}/server-sitemap.xml`,
    ],
  },
  transform: async (config, path) => ({
    loc: path,                              // => `/about`
    changefreq: config.changefreq,          // => `daily`
    priority: path === '/' ? 1.0 : config.priority,
    lastmod: new Date().toISOString(),
  }),
};
