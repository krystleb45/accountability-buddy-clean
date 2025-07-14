// postcss.config.js
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: {
    // Allow you to use `@import '…'` in your CSS
    'postcss-import': {},

    // Enable nesting like Sass
    'postcss-nested': {},

    // Tailwind's core - FIXED: Use standard tailwindcss plugin
    tailwindcss: {},

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
