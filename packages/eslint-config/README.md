# @repo/eslint-config

Shared ESLint configurations for the monorepo. Uses ESLint v9 flat config format.

## Available configs

| Import path                   | Export         | Use case                                                     |
| ----------------------------- | -------------- | ------------------------------------------------------------ |
| `@repo/eslint-config/base`    | `baseConfig`   | Runtime-agnostic base (TypeScript, imports, Prettier, Turbo) |
| `@repo/eslint-config/node`    | `nodeConfig`   | Node.js services and packages (extends base + Node globals)  |
| `@repo/eslint-config/react`   | `reactConfig`  | React libraries (extends base + React + Hooks)               |
| `@repo/eslint-config/next-js` | `nextJsConfig` | Next.js apps (extends base + React + Hooks + Next.js rules)  |

## What's included

### Base config

- `@eslint/js` recommended rules
- `typescript-eslint` recommended rules
- `eslint-config-prettier` (disables formatting rules — let Prettier handle it)
- `eslint-plugin-turbo` (Turborepo-aware env detection)
- `eslint-plugin-import` (import ordering + no default exports by default)
- `eslint-plugin-only-warn` (all errors become warnings for better DX)

### Key rules

| Rule                                | Setting | Why                                                                  |
| ----------------------------------- | ------- | -------------------------------------------------------------------- |
| `import/no-default-export`          | `error` | Named exports are enforced for consistency                           |
| `import/order`                      | `error` | Auto-sorted imports: builtin → external → internal → sibling → index |
| `@typescript-eslint/no-unused-vars` | `error` | Catches dead code                                                    |
| `curly`                             | `error` | Always use braces (no single-line if/else)                           |
| `no-debugger`                       | `error` | No debugger statements                                               |

> Config files (`*.config.js`, `*.config.mjs`, etc.) and Next.js route files (`page.tsx`, `layout.tsx`, etc.) are exempt from `no-default-export`.

## Usage

### Node.js app or package

Create `eslint.config.mjs` in your app/package root:

```js
import { nodeConfig } from "@repo/eslint-config/node"

export default [...nodeConfig]
```

### React app or package

```js
import { reactConfig } from "@repo/eslint-config/react"

export default [...reactConfig]
```

### Next.js app

```js
import { nextJsConfig } from "@repo/eslint-config/next-js"

export default [...nextJsConfig]
```

### Extending with custom rules

```js
import { nodeConfig } from "@repo/eslint-config/node"

export default [
  ...nodeConfig,

  // Your custom overrides
  {
    rules: {
      "no-console": "error"
    }
  },

  // Ignore specific directories
  {
    ignores: ["generated/**"]
  }
]
```

## Adding the dependency

Each app/package that uses these configs needs:

```json
{
  "devDependencies": {
    "@repo/eslint-config": "workspace:*"
  }
}
```

Then run `pnpm install` from the repo root.

## Running lint

```bash
# Lint everything
pnpm lint

# Lint a specific app/package
pnpm --filter @repo/worker lint
pnpm --filter docs lint

# Auto-fix
pnpm --filter @repo/worker lint:fix
```
