import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginNext from "@next/eslint-plugin-next";
import globals from "globals";
import { baseConfig } from "./base.js";

/**
 * ESLint configuration for Next.js applications.
 *
 * - Extends shared base config
 * - Adds React + Hooks rules
 * - Adds Next.js rules (recommended + core-web-vitals)
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nextJsConfig = [
  ...baseConfig,

  // JS + TS (Next runtime)
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Default Next ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // React rules
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // New JSX transform
      "react/react-in-jsx-scope": "off",
    },
  },

  // React Hooks rules
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },

  // Next.js rules (replaces eslint-config-next)
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },
  {
    files: [
      "app/**/page.tsx",
      "app/**/layout.tsx",
      "app/**/error.tsx",
      "app/**/loading.tsx",
      "app/**/not-found.tsx",
      "app/**/template.tsx",
      "next.config.js",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  }
];
