---
name: env-patterns
description: |
  How the @repo/env package works in this repo. Zod-validated environment variables.
  Use when: adding new env variables, creating env.ts files, or debugging env validation errors.
---

# Env Patterns — @repo/env

## How it works

1. Each app has a `src/env.ts` (or `env.ts` at root for Next.js apps)
2. Uses a factory function for the target runtime
3. Schemas validate at import time — app crashes on startup if invalid

## Factories

| Import                                 | Runtime          | Client prefix  |
| -------------------------------------- | ---------------- | -------------- |
| `@repo/env/node` → `createNodeEnv()`   | Node.js services | N/A            |
| `@repo/env/react` → `createReactEnv()` | Vite / React     | `VITE_`        |
| `@repo/env/next` → `createNextEnv()`   | Next.js          | `NEXT_PUBLIC_` |

## Available schemas (`@repo/env/schema`)

| Schema           | Type   | Constraint                    |
| ---------------- | ------ | ----------------------------- |
| `nonEmptyString` | string | min 1 char                    |
| `url`            | string | valid URL                     |
| `port`           | number | 1–65535                       |
| `positiveInt`    | number | >= 1                          |
| `nodeEnv`        | enum   | development, test, production |
| `appEnv`         | enum   | local, staging, production    |
| `poolSize`       | number | 1–50                          |
| `redisDbIndex`   | number | 0–15                          |
| `serviceToken`   | string | min 32 chars                  |
| `jwtSecret`      | string | min 32 chars                  |

## Adding a new env variable

### Step 1 — Add to `.env.example`

```env
MY_NEW_VAR=some-value
```

### Step 2 — Add to `src/env.ts`

```ts
import { createNodeEnv } from "@repo/env/node"
import { nonEmptyString } from "@repo/env/schema"

export const env = createNodeEnv({
  // ... existing vars ...
  MY_NEW_VAR: nonEmptyString
})
```

### Step 3 — Use it

```ts
import { env } from "./env.js"

console.log(env.MY_NEW_VAR) // typed and validated
```

## Defaults

```ts
import { port } from "@repo/env/schema"

export const env = createNodeEnv({
  PORT: port.default(4000) // uses 4000 if PORT is not set
})
```

## Rules

- **Never use `process.env` directly** — always go through `env.ts`
- **Each app owns its own `.env`** — no root `.env` file
- **Add new schemas to `packages/env/src/schema/index.ts`** if the built-in ones don't cover your case
