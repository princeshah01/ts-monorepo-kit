import { baseConfig } from "@repo/eslint-config/base"

/** @type {import("eslint").ConfigObject[]} */
export default [
  ...baseConfig,

  // TypeScript files
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd()
      }
    },
    rules: {
      // env package must stay runtime-agnostic
      "no-restricted-globals": [
        "error",
        { name: "window", message: "env package must be runtime-agnostic" },
        { name: "document", message: "env package must be runtime-agnostic" }
      ],

      // discourage direct env access outside factories
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message: "Do not access process.env directly outside env factories"
        }
      ]
    }
  },

  // ESLint config files run in Node
  {
    files: ["eslint.config.mjs", "eslint.config.js"],
    languageOptions: {
      globals: {
        process: "readonly"
      }
    }
  }
]
