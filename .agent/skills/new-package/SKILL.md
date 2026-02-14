---
name: new-package
description: |
  How to create a new internal package in this monorepo.
  Use when: extracting shared code, creating a new utility package, or adding a new library.
---

# Creating a New Package

## Steps

### 1. Create the directory

```
packages/my-package/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── eslint.config.mjs
```

### 2. package.json

```json
{
  "name": "@repo/my-package",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint --fix .",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.15.3",
    "typescript": "5.9.2"
  }
}
```

### 3. tsconfig.json

```json
{
  "extends": "@repo/typescript-config/node.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

### 4. eslint.config.mjs

```js
import { nodeConfig } from "@repo/eslint-config/node"

export default [...nodeConfig]
```

### 5. Install

```bash
pnpm install
```

### 6. Use in an app

Add to the consuming app's `package.json`:

```json
{
  "dependencies": {
    "@repo/my-package": "workspace:*"
  }
}
```

Then import:

```ts
import { something } from "@repo/my-package"
```

## Conventions

- Use `@repo/` scope for all internal packages
- Use JIT (Just-In-Time) compilation: export `.ts` directly, no build step needed
- Use named exports only (no default exports)
- Always add `@repo/eslint-config` and `@repo/typescript-config` as devDeps
