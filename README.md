# turbo-backend-starter

Production-grade TypeScript monorepo for backend services, workers, and shared packages.

## Stack

- **Runtime:** Node.js >= 18, TypeScript 5.9
- **Monorepo:** Turborepo + pnpm workspaces
- **Queue:** BullMQ (Redis-backed)
- **Cache:** ioredis wrapper with namespace isolation
- **Env:** Zod-validated via @t3-oss/env
- **Lint:** ESLint v9 flat config (shared configs)
- **Formatting:** Prettier

## Structure

```
apps/
  auth-service/     API service (placeholder — not yet implemented)
  docs/             Next.js documentation site
  worker/           Background job processor (BullMQ)

packages/
  env/              Zod-based env validation (node, react, next)
  eslint-config/    Shared ESLint configs (base, node, next, react)
  logger/           Lightweight contextual logger
  queue/            BullMQ queue + worker service
  redis/            ioredis wrapper with caching, key builder, single-flight
  typescript-config/ Shared tsconfig presets
  ui/               React component library (Tailwind CSS)
```

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment files
cp apps/worker/.env.example apps/worker/.env
cp apps/auth-service/.env.example apps/auth-service/.env

# 3. Start Redis (required for queue and cache)
# Make sure Redis is running on localhost:6379

# 4. Run all apps/packages in dev mode
pnpm dev

# 5. Or run a specific app
pnpm --filter @repo/worker dev
pnpm --filter docs dev
```

## Common commands

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `pnpm dev`         | Run all apps + packages in dev mode |
| `pnpm build`       | Build everything                    |
| `pnpm lint`        | Lint everything                     |
| `pnpm lint:fix`    | Auto-fix lint issues                |
| `pnpm check-types` | Type-check everything               |

### Filter commands

```bash
# Run a specific app/package
pnpm --filter @repo/worker dev
pnpm --filter @repo/redis check-types
pnpm --filter docs dev
```

## Environment variables

Each app has a `.env.example` file. Copy and fill in:

```bash
cp apps/worker/.env.example apps/worker/.env
cp apps/auth-service/.env.example apps/auth-service/.env
```

> See the [@repo/env README](packages/env/README.md) for how environment validation works and how to add new variables.

---

## How to use the shared packages

### Queue — enqueue background jobs from any app

The queue package lets you define typed jobs and process them in the worker.

**Quick version:**

```ts
import { QueueService } from "@repo/queue"

const queue = new QueueService({ redis, logger })

await queue.addJob("email.send", {
  to: "user@example.com",
  subject: "Welcome!",
  body: "Thanks for signing up."
})
```

The worker app picks up the job and runs the matching handler.

> **Full guide:** [packages/queue/README.md](packages/queue/README.md) — covers defining job types, writing handlers, starting the worker, and the complete API.

---

### Redis — caching and data access from controllers

The Redis package provides a cache-aside pattern for controllers:

**Quick version:**

```ts
import { RedisClient } from "@repo/redis"

const redis = new RedisClient({
  url: process.env.REDIS_URL!,
  namespace: "auth-service"
})

// Cache-aside: tries cache first, fetches on miss
const user = await redis.getOrSet(
  redis.keyBuilder.cacheKeyById("users", userId),
  {
    ttl: 300,
    fetcher: async () => db.user.findUnique({ where: { id: userId } })
  }
)

// Invalidate after mutation
const keys = redis.keyBuilder.invalidateById("users", userId)
await redis.invalidate(keys.exact)
await redis.invalidateByPattern(keys.listPattern)
```

> **Full guide:** [packages/redis/README.md](packages/redis/README.md) — covers setup, controller usage, key building, invalidation patterns, and health checks.

---

### Env — type-safe environment variables

Define and validate env variables with Zod:

```ts
import { createNodeEnv } from "@repo/env/node"
import { url, port, nodeEnv } from "@repo/env/schema"

export const env = createNodeEnv({
  NODE_ENV: nodeEnv,
  REDIS_URL: url,
  PORT: port.default(4000)
})
```

> **Full guide:** [packages/env/README.md](packages/env/README.md) — covers Node.js, React/Vite, and Next.js usage, plus all available schemas.

---

### ESLint — shared lint configs

Use pre-built configs in your `eslint.config.mjs`:

```js
// Node.js app
import { nodeConfig } from "@repo/eslint-config/node"
export default [...nodeConfig]

// Next.js app
import { nextJsConfig } from "@repo/eslint-config/next-js"
export default [...nextJsConfig]

// React app
import { reactConfig } from "@repo/eslint-config/react"
export default [...reactConfig]
```

> **Full guide:** [packages/eslint-config/README.md](packages/eslint-config/README.md) — covers all available configs, included rules, and how to extend.

---

## Package reference

| Package                   | Description                   | README                                     |
| ------------------------- | ----------------------------- | ------------------------------------------ |
| `@repo/queue`             | BullMQ queue + worker service | [README](packages/queue/README.md)         |
| `@repo/redis`             | ioredis wrapper with caching  | [README](packages/redis/README.md)         |
| `@repo/env`               | Zod-validated env variables   | [README](packages/env/README.md)           |
| `@repo/eslint-config`     | Shared ESLint configs         | [README](packages/eslint-config/README.md) |
| `@repo/logger`            | Contextual console logger     | [README](packages/logger/README.md)        |
| `@repo/typescript-config` | Shared tsconfig presets       | —                                          |
| `@repo/ui`                | React component library       | —                                          |

## Apps

| App            | Description                | README                                |
| -------------- | -------------------------- | ------------------------------------- |
| `worker`       | Background job processor   | [README](apps/worker/README.md)       |
| `docs`         | Next.js documentation site | [README](apps/docs/README.md)         |
| `auth-service` | REST API (placeholder)     | [README](apps/auth-service/README.md) |
