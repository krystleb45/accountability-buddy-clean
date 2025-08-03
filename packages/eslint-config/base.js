import antfu from "@antfu/eslint-config";
import prettierConflicts from "eslint-config-prettier";

const baseConfig = antfu({}, prettierConflicts).overrideRules({
  "perfectionist/sort-imports": [
    "warn",
    {
      partitionByComment: true,
    },
  ],
  "node/prefer-global/process": "off",
  "node/prefer-global/buffer": "off",
});

export default baseConfig;
