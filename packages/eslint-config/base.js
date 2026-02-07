import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import tseslint from "typescript-eslint"
import turboPlugin from "eslint-plugin-turbo"
import onlyWarn from "eslint-plugin-only-warn"
import importPlugin from "eslint-plugin-import"

/**
 * Shared ESLint base configuration.
 * - Runtime agnostic
 * - Used by Node, React, Next
 */
export const baseConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,

  {
    plugins: {
      turbo: turboPlugin,
      import: importPlugin
    },
    rules: {
      // Turbo
      "turbo/no-undeclared-env-vars": "warn",

      // Style & consistency
      quotes: ["error", "double"],
      semi: "off",
      "comma-dangle": ["error", "never"],
      "no-console": "off",
      "no-debugger": "error",
      "no-param-reassign": "off",
      "no-shadow": "off",
      "no-tabs": "off",
      "arrow-parens": "off",
      "eol-last": "off",
      "linebreak-style": "off",
      "template-curly-spacing": "off",
      curly: ["error", "all"],

      // Imports
      "import/export": "off",
      "import/prefer-default-export": "off",
      "import/no-default-export": "error",
      "import/no-cycle": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "object"
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ],

      // TypeScript
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error"
    }
  },

  // TypeScript-specific overrides
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-undef": "off"
    }
  },

  // Universal ignores
  {
    ignores: ["node_modules/**", "dist/**", "build/**"]
  },

  // DX choice: convert errors to warnings
  {
    plugins: {
      onlyWarn
    }
  },
  {
    files: ["eslint.config.js", "eslint.config.mjs"],
    rules: {
      "import/no-default-export": "off"
    }
  }
]
