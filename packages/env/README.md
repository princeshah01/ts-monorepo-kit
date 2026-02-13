# @repo/env

Zod-validated environment variable helpers for the monorepo.

## Exports

| Export             | Use case                                                   |
| ------------------ | ---------------------------------------------------------- |
| `@repo/env/node`   | `createNodeEnv()` for Node.js services                     |
| `@repo/env/react`  | `createReactEnv()` for Vite/React apps (VITE\_ prefix)     |
| `@repo/env/next`   | `createNextEnv()` for Next.js apps (NEXT*PUBLIC* prefix)   |
| `@repo/env/schema` | Reusable Zod schemas (`port`, `redisUrl`, `nodeEnv`, etc.) |

## Available schemas

| Schema             | Type     | Description                         |
| ------------------ | -------- | ----------------------------------- |
| `nonEmptyString`   | `string` | Non-empty string                    |
| `url`              | `string` | Valid URL                           |
| `port`             | `number` | Integer 1-65535                     |
| `number`           | `number` | Positive integer                    |
| `nodeEnv`          | `enum`   | `development`, `test`, `production` |
| `appEnv`           | `enum`   | `local`, `staging`, `production`    |
| `databaseUrl`      | `string` | Valid URL (alias)                   |
| `databasePoolSize` | `number` | Integer 1-50                        |
| `redisUrl`         | `string` | Valid URL (alias)                   |
| `redisDbIndex`     | `number` | Integer 0-15                        |
| `rabbitMqUrl`      | `string` | Valid URL (alias)                   |
| `serviceToken`     | `string` | Min 32 chars                        |
| `jwtSecret`        | `string` | Min 32 chars                        |

## Usage

### Node ENV
```ts
import { createNodeEnv } from "@repo/env/node"
import { redisUrl, port, nodeEnv } from "@repo/env/schema"

export const env = createNodeEnv({
  NODE_ENV: nodeEnv,
  REDIS_URL: redisUrl,
  PORT: port.default(4000)
})

```
### React ENV

```ts

import 

```

## Scripts

```bash
pnpm --filter @repo/env lint
pnpm --filter @repo/env check-types
```
