import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { baseConfig } from "./base.js";

/**
 * ESLint configuration for React applications and libraries.
 *
 * - Extends shared base config
 * - Adds React + Hooks rules
 * - Browser runtime
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const reactConfig = [
  ...baseConfig,

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
];
