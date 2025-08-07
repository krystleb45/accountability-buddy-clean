import config from "@ab/eslint-config/base"
import { combine, react } from "@antfu/eslint-config"
import nextPlugin from "@next/eslint-plugin-next"
import tailwindPlugin from "eslint-plugin-better-tailwindcss"
import cypressPlugin from "eslint-plugin-cypress"
import jestPlugin from "eslint-plugin-jest"

export default combine(
  react(),
  config,
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
  {
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/app/global.css",
      },
    },
    plugins: {
      "better-tailwindcss": tailwindPlugin,
    },
    rules: {
      // enable all recommended rules to report an error
      ...tailwindPlugin.configs["recommended-error"].rules,

      // or configure rules individually
      "better-tailwindcss/no-unregistered-classes": [
        "error",
        {
          ignore: ["dark", "toaster"],
        },
      ],
    },
  },
)
