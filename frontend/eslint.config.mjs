// eslint.config.mjs
import globals from 'globals';
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import cypress from 'eslint-plugin-cypress';

export default [
  // 0) Also ignore via ignorePatterns (flat‐config)
  {
    ignorePatterns: ['jest.config.js', 'src/tests/stubs/**/*'],
  },

  // 1) Top‐level ignores
  {
    ignores: [
      'eslint.config.mjs',
      'jest.config.js',          // ← ignore our Jest config
      'next-sitemap.config.*',
      'next.config.*',
      'postcss.config.js',
      'tailwind.config.*',
      '**/*.mjs',
      '.next/',
      'node_modules/',
      'dist/',
      '.storybook/',
      'coverage/',
      'cypress/support/**/*.d.ts',
      'scripts/',                // ← ignore our helper scripts
    ],
  },

  // 2) Base JS/TS/React rules
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        cy: 'readonly',
        Cypress: 'readonly',
        jest: 'readonly',
        test: 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react,
      'jsx-a11y': jsxA11y,
      prettier,
      cypress,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      'prettier/prettier': 'error',
      'linebreak-style': ['error', 'unix'],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'warn',
      'react/jsx-no-target-blank': ['warn', { allowReferrer: true, enforceDynamicLinks: 'always' }],
      'react/jsx-key': 'warn',
      'react/jsx-no-comment-textnodes': 'warn',
      'jsx-a11y/anchor-is-valid': ['warn', { aspects: ['invalidHref', 'preferButton'] }],
      'no-undef': 'off',
    },
  },

  // 3) Cypress spec files (.cy.ts/.cy.tsx)
  {
    files: ['cypress/**/*.ts', 'cypress/**/*.d.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      'no-undef': 'off',
    },
  },

  // 4) Don’t try to type‐check your Cypress config
  {
    files: ['cypress.config.ts'],
    languageOptions: {
      parserOptions: {
        project: undefined,  // skip project-based type-checking here
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },

  // 5) Jest test files override
  {
    files: ['**/*.test.{js,ts,jsx,tsx}'],
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-undef': 'off',
    },
  },

  // 6) Don’t type‐check our helper scripts
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: undefined,   // skip tsconfig for these
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
];
