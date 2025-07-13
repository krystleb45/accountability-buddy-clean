// postcss.config.js
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: {
    // Allow you to use `@import '…'` in your CSS
    'postcss-import': {},

    // Enable nesting like Sass
    'postcss-nested': {},

    // Tailwind's core - using the new separate package
    '@tailwindcss/postcss': {},

    // Add vendor prefixes
    autoprefixer: {},

    // Minify in production
    ...(isProd
      ? {
          cssnano: { preset: 'default' },
        }
      : {}),
  },
};
