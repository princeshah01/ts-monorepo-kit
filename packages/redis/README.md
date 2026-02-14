# @repo/redis

Shared Redis client for this monorepo. Wraps `ioredis` with logging, cache helpers, and namespace-safe invalidation.

## What this package provides

| Export                      | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| `RedisClient`               | Typed wrapper over `ioredis` with caching methods         |
| `ResourceCacheKeyBuilder`   | Deterministic cache key builder for IDs and list queries  |
| `SingleFlight`              | Deduplicates concurrent `getOrSet` calls for the same key |
| `serialize` / `deserialize` | JSON helpers for Redis values                             |

## Setup

### 1. Install

Already included in the monorepo. Add to your app's `package.json`:

```json
{
  "dependencies": {
    "@repo/redis": "workspace:*"
  }
}
```

Then run `pnpm install` from the repo root.

### 2. Create a Redis client

Typically done once at app startup:

```ts
import { RedisClient } from "@repo/redis"
import { Logger } from "@repo/logger"

const logger = new Logger("AuthService")

export const redis = new RedisClient(
  {
    url: process.env.REDIS_URL!,
    namespace: "auth-service", // required — isolates keys per service
    cacheKeyPrefix: "cache" // optional, defaults to "cache"
  },
  logger
)
```

## Using inside a controller

Here's a real-world example of using Redis for caching in a controller / route handler:

### Cache-aside pattern (`getOrSet`)

```ts
import { redis } from "../redis.js"

async function getUserById(userId: string) {
  const key = redis.keyBuilder.cacheKeyById("users", userId)

  const user = await redis.getOrSet(key, {
    ttl: 300, // cache for 5 minutes
    fetchTimeoutMs: 2000, // abort fetch after 2s
    fetcher: async () => {
      // This runs ONLY on cache miss
      const row = await db.user.findUnique({ where: { id: userId } })
      return row ?? null
    }
  })

  return user
}
```

**What happens:**

1. Checks Redis for the cached value.
2. On cache hit → returns immediately (no DB call).
3. On cache miss → runs `fetcher`, caches the result, returns it.
4. Concurrent calls for the same key are coalesced (single-flight).

### Manual get/set

```ts
async function getProduct(id: string) {
  const key = redis.keyBuilder.cacheKeyById("products", id)

  // Try cache first
  const cached = await redis.get<Product>(key)
  if (cached) return cached

  // Fetch from DB
  const product = await db.product.findUnique({ where: { id } })

  // Cache it
  if (product) {
    await redis.set(key, product, { ttl: 600 })
  }

  return product
}
```

### Invalidation after mutation

```ts
async function updateUser(userId: string, data: UpdateUserDto) {
  await db.user.update({ where: { id: userId }, data })

  // Invalidate the specific user cache + all list caches for users
  const keys = redis.keyBuilder.invalidateById("users", userId)
  await redis.invalidate(keys.exact)
  await redis.invalidateByPattern(keys.listPattern)
}
```

### List caching with query keys

```ts
async function listUsers(query: { page: number; role: string }) {
  const key = redis.keyBuilder.cacheKeyForList("users", query)

  return redis.getOrSet(key, {
    ttl: 120,
    fetcher: async () => {
      return db.user.findMany({
        where: { role: query.role },
        skip: (query.page - 1) * 20,
        take: 20
      })
    }
  })
}
```

> The key builder hashes the query object deterministically, so `{ page: 1, role: "admin" }`
> and `{ role: "admin", page: 1 }` produce the same cache key.

## Key building

```ts
// Single resource by ID
const key = redis.keyBuilder.cacheKeyById("users", "user_123")
// → "auth-service:cache:users:id:user_123"

// List with query params
const key = redis.keyBuilder.cacheKeyForList("users", {
  page: 1,
  role: "admin"
})
// → "auth-service:cache:users:list:<sha256-hash>"

// Invalidation helpers
const inv = redis.keyBuilder.invalidateById("users", "user_123")
// → { exact: "auth-service:cache:users:id:user_123", listPattern: "auth-service:cache:users:list:*" }

// Invalidate all keys for a resource
const pattern = redis.keyBuilder.invalidateAll("users")
// → "auth-service:cache:users:*"

// Invalidate everything in this namespace
const pattern = redis.keyBuilder.invalidateAll()
// → "auth-service:cache:*"
```

## All invalidation methods

```ts
// Exact key
await redis.invalidate(key)

// Multiple exact keys
await redis.invalidateMany("k1", "k2", "k3")

// Pattern (must be within your namespace)
await redis.invalidateByPattern("auth-service:cache:users:list:*")

// All keys in your namespace + prefix
await redis.invalidateNamespace()
```

> `invalidateByPattern` rejects patterns outside your configured namespace to prevent accidental global deletes.

## Health & lifecycle

```ts
const ok = await redis.ping() // true when Redis responds with PONG

// On app shutdown
await redis.disconnect()
```

## Environment

```env
REDIS_URL=redis://localhost:6379
```

The `namespace` is set in code (usually per-service), not via env.

## Types

```ts
import type {
  RedisClientOptions,
  CacheSetOptions,
  CacheGetOrSetOptions,
  InvalidateByPatternOptions
} from "@repo/redis"
```

## Validation

```bash
pnpm --filter @repo/redis lint
pnpm --filter @repo/redis check-types
```
