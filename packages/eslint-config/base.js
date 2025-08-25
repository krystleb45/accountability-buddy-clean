import antfu from "@antfu/eslint-config"
import prettierConflicts from "eslint-config-prettier"

const baseConfig = antfu({}, prettierConflicts, {
  ignores: ["**/*.gen.ts"],
}).overrideRules({
  "perfectionist/sort-imports": [
    "warn",
    {
      partitionByComment: true,
    },
  ],
  "node/prefer-global/process": "off",
  "node/prefer-global/buffer": "off",
  "antfu/if-newline": "warn",
})

export default baseConfig
