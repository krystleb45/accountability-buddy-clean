/** @type {import('tailwindcss').Config} */
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
const aspectRatio = require('@tailwindcss/aspect-ratio');
const containerQueries = require('@tailwindcss/container-queries');

module.exports = {
  content: {
    relative: true, // Important for monorepos!
    files: [
      // Next.js App Router structure
      './src/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',

      // If you're also using Pages Router (remove if not)
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',

      // Remove these lines if you don't have these directories:
      // './layouts/**/*.{js,ts,jsx,tsx,mdx}',
      // './stories/**/*.{js,ts,jsx,tsx,mdx}',

      // Don't scan CSS files for classes - this can cause issues
      // './styles/**/*.css',
      // './styles/global.css',

      // Only include if you have HTML files with Tailwind classes
      // './public/**/*.html',
    ],
  },
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',          // Blue
        secondary: '#9333EA',
        'secondary-hover': '#D97706',
        'kelly-green': '#4CAF50',
        accent: '#F59E0B',
        darkBg: '#1E293B',
        lightBg: '#F9FAFB',
        headerBlue: '#2563EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    forms,
    typography,
    aspectRatio,
    containerQueries,
  ],
};
