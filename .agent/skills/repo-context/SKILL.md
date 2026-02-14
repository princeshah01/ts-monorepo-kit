---
name: repo-context
description: |
  Context about the turbo-backend-starter monorepo structure, packages, apps, and conventions.
  Use when: working on any part of this repo, creating new packages/apps, or understanding how things connect.
---

# Repo Context — turbo-backend-starter

## Stack

- **Runtime:** Node.js >= 18, TypeScript 5.9
- **Monorepo:** Turborepo + pnpm 9 workspaces
- **Package manager:** pnpm (strict, no hoisting)
- **Queue:** BullMQ (Redis-backed)
- **Cache:** ioredis wrapper with namespace isolation
- **Env validation:** Zod via @t3-oss/env
- **Lint:** ESLint v9 flat config (shared configs)
- **Formatting:** Prettier

## Workspace layout

```
apps/
  auth-service/     # REST API (placeholder — not yet implemented)
  docs/             # Next.js documentation site
  worker/           # BullMQ background job processor

packages/
  env/              # Zod-based env validation (node, react, next)
  eslint-config/    # Shared ESLint flat configs (base, node, next, react)
  logger/           # Lightweight contextual console logger
  queue/            # BullMQ QueueService + WorkerService
  redis/            # ioredis wrapper: caching, key builder, single-flight
  typescript-config/ # Shared tsconfig presets
  ui/               # React component library
```

## Package naming

All internal packages use `@repo/` scope:

- `@repo/queue`, `@repo/redis`, `@repo/env`, `@repo/logger`, `@repo/eslint-config`, `@repo/typescript-config`, `@repo/ui`

Apps: `@repo/worker`, `docs`, `auth-service`

## Dependency graph

```
auth-service (planned) ──► @repo/queue ──► @repo/redis ──► @repo/logger
                       ──► @repo/redis                     ioredis
                       ──► @repo/env                       bullmq
                       ──► @repo/logger

worker ──► @repo/queue
       ──► @repo/redis
       ──► @repo/env
       ──► @repo/logger

docs ──► @repo/ui
     ──► @repo/env

All apps/packages ──► @repo/eslint-config (devDep)
                  ──► @repo/typescript-config (devDep)
```

## turbo.json tasks

| Task          | dependsOn  | outputs               | Notes                              |
| ------------- | ---------- | --------------------- | ---------------------------------- |
| `build`       | `^build`   | `.next/**`, `dist/**` | Includes `.env*` in inputs         |
| `prepare`     | `^prepare` | —                     | Pre-build step                     |
| `lint`        | `prepare`  | —                     | Parallel, cached                   |
| `lint:fix`    | `prepare`  | —                     |                                    |
| `check-types` | `prepare`  | —                     | Parallel, cached                   |
| `dev`         | —          | —                     | `cache: false`, `persistent: true` |

## Root scripts

Root `package.json` only delegates via `turbo run`:

```json
{
  "build": "turbo run build",
  "dev": "turbo run dev",
  "lint": "turbo run lint",
  "lint:fix": "turbo run lint:fix",
  "check-types": "turbo run check-types"
}
```

## Conventions

1. **No default exports** — `import/no-default-export` is enforced (config files and Next.js routes are exempt)
2. **Named exports only** — `export { ClassName }` or `export function`
3. **Env validation** — every app has `src/env.ts` using `@repo/env` factories. Never use `process.env` directly.
4. **Workspace deps** — always use `"workspace:*"` for internal packages
5. **ESLint config** — each app/package has `eslint.config.mjs` importing from `@repo/eslint-config`
6. **TypeScript config** — each app/package has `tsconfig.json` extending `@repo/typescript-config`
