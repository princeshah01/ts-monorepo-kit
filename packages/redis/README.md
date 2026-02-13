# @repo/redis

Shared Redis utilities for this monorepo.

## What this package provides

- `RedisClient`: typed wrapper over `ioredis` with logging, caching helpers, and namespace-safe invalidation.
- `ResourceCacheKeyBuilder`: deterministic cache key builder for IDs and list queries.
- `SingleFlight`: deduplicates concurrent `getOrSet` calls for the same key.
- `serialize` / `deserialize`: JSON helpers for Redis values.

## Environment

Set these in your service/app environment:

```env
REDIS_URL=redis://localhost:6379
REDIS_NAMESPACE=auth-service
```

- `REDIS_URL` is required.
- `REDIS_NAMESPACE` is required and should be unique per service.

## Basic setup

```ts
import { RedisClient } from "@repo/redis"

export const redis = new RedisClient({
  url: process.env.REDIS_URL!,
  namespace: process.env.REDIS_NAMESPACE!,
  cacheKeyPrefix: "cache"
})
```

## Key building

```ts
const userByIdKey = redis.keyBuilder.cacheKeyById("users", "user_123")
const userListKey = redis.keyBuilder.cacheKeyForList("users", {
  page: 1,
  role: "admin"
})
```

Use `cacheKeyForList` for query-based keys (sorting/hashing is deterministic).

## Read/write cache

```ts
await redis.set(userByIdKey, { id: "user_123", name: "Prince" }, { ttl: 300 })

const user = await redis.get<{ id: string; name: string }>(userByIdKey)
```

## Cache-aside (`getOrSet`)

```ts
const key = redis.keyBuilder.cacheKeyById("users", "user_123")

const user = await redis.getOrSet(key, {
  ttl: 300,
  fetchTimeoutMs: 2000,
  fetcher: async () => {
    const row = await db.user.findUnique({ where: { id: "user_123" } })
    return row ?? null
  }
})
```

Notes:

- Calls for the same key are coalesced while fetch is in-flight.
- If fetcher times out or throws, `null` is returned.

## Invalidation patterns

```ts
// exact key
await redis.invalidate(redis.keyBuilder.cacheKeyById("users", "user_123"))

// multiple keys
await redis.invalidateMany("k1", "k2", "k3")

// exact + list pattern for one id
const userInvalidation = redis.keyBuilder.invalidateById("users", "user_123")
await redis.invalidate(userInvalidation.exact)
await redis.invalidateByPattern(userInvalidation.listPattern)

// all keys for one resource
await redis.invalidateByPattern(redis.keyBuilder.invalidateAll("users"))

// all keys in current namespace + prefix
await redis.invalidateNamespace()
```

`invalidateByPattern` rejects patterns outside your configured namespace to prevent accidental global deletes.

## Health + lifecycle

```ts
const ok = await redis.ping() // true when Redis responds with PONG

// on service shutdown
await redis.disconnect()
```

## API surface

```ts
import type {
  RedisClientOptions,
  CacheSetOptions,
  CacheGetOrSetOptions,
  InvalidateByPatternOptions
} from "@repo/redis"
```

## Validate this package

From repo root:

```bash
pnpm --filter @repo/redis lint
pnpm --filter @repo/redis check-types
```
