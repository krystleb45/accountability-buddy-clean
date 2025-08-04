import config from "@ab/eslint-config/base"
import { combine, react } from "@antfu/eslint-config"
import nextPlugin from "@next/eslint-plugin-next"
import cypressPlugin from "eslint-plugin-cypress"
import jestPlugin from "eslint-plugin-jest"
import tailwind from "eslint-plugin-tailwindcss"

export default combine(
  react(),
  config,
  ...tailwind.configs["flat/recommended"],
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    plugins: { jest: jestPlugin },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
  },
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    plugins: {
      cypress: cypressPlugin,
    },
    files: ["cypress/e2e/**/*.cy.{js,ts}"],
  },
  {
    rules: {
      "no-console": "warn",
      "no-alert": "warn",
      "react-hooks-extra/no-direct-set-state-in-use-effect": "warn",
    },
  },
)
