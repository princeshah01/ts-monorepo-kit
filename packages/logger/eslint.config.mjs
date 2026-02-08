import { baseConfig } from "@repo/eslint-config/base"

/** @type {import("eslint").ConfigObject[]} */
export default [
  ...baseConfig,

  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    rules: {
      // logger must remain portable
      "no-restricted-globals": [
        "error",
        { name: "window", message: "Logger must be runtime-agnostic" },
        { name: "document", message: "Logger must be runtime-agnostic" },
        { name: "process", message: "Logger must be runtime-agnostic" }
      ],

      // console is allowed explicitly here
      "no-console": "off"
    }
  }
]
