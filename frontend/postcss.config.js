// postcss.config.js
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    '@tailwindcss/postcss': {},  // ← Correct package name
    autoprefixer: {},
    ...(isProd ? { cssnano: { preset: 'default' } } : {}),
  },
};
