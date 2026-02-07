import globals from "globals";
import { baseConfig } from "./base.js";

/**
 * ESLint configuration for Node.js / Express services.
 *
 * - Extends shared base config
 * - Enables Node.js globals
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nodeConfig = [
  ...baseConfig,

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
