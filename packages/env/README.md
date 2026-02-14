# @repo/env

Zod-validated environment variable helpers for the monorepo. Built on top of [`@t3-oss/env`](https://env.t3.gg/).

## Why

- **Type-safe** — environment variables are validated at startup with Zod. If a variable is missing or invalid, the app crashes immediately with a clear error.
- **No magic strings** — access env values as typed properties (e.g. `env.PORT`), not raw `process.env`.
- **Shared schemas** — common validators (port, url, nodeEnv, etc.) are reusable across apps.

## Exports

| Import path        | Factory function   | Use case                                     |
| ------------------ | ------------------ | -------------------------------------------- |
| `@repo/env/node`   | `createNodeEnv()`  | Node.js services (Express, workers, scripts) |
| `@repo/env/react`  | `createReactEnv()` | Vite / React apps (`VITE_` prefix)           |
| `@repo/env/next`   | `createNextEnv()`  | Next.js apps (`NEXT_PUBLIC_` prefix)         |
| `@repo/env/schema` | —                  | Reusable Zod schemas                         |

## Available schemas

| Schema           | Type     | Description                         |
| ---------------- | -------- | ----------------------------------- |
| `nonEmptyString` | `string` | Non-empty string                    |
| `url`            | `string` | Valid URL                           |
| `port`           | `number` | Integer 1–65535                     |
| `positiveInt`    | `number` | Positive integer                    |
| `nodeEnv`        | `enum`   | `development`, `test`, `production` |
| `appEnv`         | `enum`   | `local`, `staging`, `production`    |
| `poolSize`       | `number` | Integer 1–50                        |
| `redisDbIndex`   | `number` | Integer 0–15                        |
| `serviceToken`   | `string` | Min 32 chars                        |
| `jwtSecret`      | `string` | Min 32 chars                        |

## Usage

### Node.js service

```ts
// apps/worker/src/env.ts
import { createNodeEnv } from "@repo/env/node"
import { url, nonEmptyString, poolSize } from "@repo/env/schema"

export const env = createNodeEnv({
  REDIS_URL: url,
  QUEUE_NAME: nonEmptyString,
  WORKER_CONCURRENCY: poolSize
})

// env.REDIS_URL     → string (validated URL)
// env.QUEUE_NAME    → string (non-empty)
// env.WORKER_CONCURRENCY → number (1–50)
```

### React (Vite) app

```ts
// apps/my-react-app/src/env.ts
import { createReactEnv } from "@repo/env/react"
import { url, nonEmptyString } from "@repo/env/schema"

export const env = createReactEnv({
  client: {
    VITE_API_URL: url,
    VITE_APP_NAME: nonEmptyString
  }
})

// env.VITE_API_URL  → string (validated URL)
// env.VITE_APP_NAME → string (non-empty)
```

> Client variables **must** be prefixed with `VITE_`.

### Next.js app

```ts
// apps/docs/env.ts
import { createNextEnv } from "@repo/env/next"
import { nonEmptyString } from "@repo/env/schema"

export const env = createNextEnv({
  server: {
    SECRET_KEY: nonEmptyString
  },
  client: {
    NEXT_PUBLIC_APP_URL: nonEmptyString
  }
})

// env.SECRET_KEY          → string (server only)
// env.NEXT_PUBLIC_APP_URL → string (available client-side)
```

> Client variables **must** be prefixed with `NEXT_PUBLIC_`.

### Using defaults

```ts
import { createNodeEnv } from "@repo/env/node"
import { port, nodeEnv } from "@repo/env/schema"

export const env = createNodeEnv({
  NODE_ENV: nodeEnv,
  PORT: port.default(4000) // defaults to 4000 if not set
})
```

## How it works

1. You define an env file (e.g. `src/env.ts`) in each app.
2. Import the correct factory for your runtime (`createNodeEnv`, `createReactEnv`, or `createNextEnv`).
3. Pass a schema object mapping env var names to Zod validators.
4. Import `env` anywhere in your app — it's validated at import time.

If any variable is missing or fails validation, the app will crash on startup with a descriptive error.

## Validation

```bash
pnpm --filter @repo/env lint
pnpm --filter @repo/env check-types
```
