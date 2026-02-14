---
name: redis-patterns
description: |
  How the @repo/redis package works in this repo. ioredis wrapper with caching patterns.
  Use when: adding caching to controllers, building cache keys, invalidating cache, or debugging Redis issues.
---

# Redis Patterns — @repo/redis

## Setup in an app

```ts
import { RedisClient } from "@repo/redis"
import { Logger } from "@repo/logger"

const redis = new RedisClient(
  {
    url: process.env.REDIS_URL!,
    namespace: "auth-service", // required, isolates cache keys per service
    cacheKeyPrefix: "cache" // optional, defaults to "cache"
  },
  new Logger("Redis")
)
```

## Cache-aside pattern (preferred)

```ts
const key = redis.keyBuilder.cacheKeyById("users", userId)

const user = await redis.getOrSet(key, {
  ttl: 300, // seconds
  fetchTimeoutMs: 2000, // abort fetch after 2s
  fetcher: async () => {
    return db.user.findUnique({ where: { id: userId } })
  }
})
```

- Cache hit → returns cached value, no DB call
- Cache miss → runs `fetcher`, caches result, returns it
- Concurrent calls for the same key are coalesced (single-flight)

## Key building

```ts
redis.keyBuilder.cacheKeyById("users", "u_123")
// → "auth-service:cache:users:id:u_123"

redis.keyBuilder.cacheKeyForList("users", { page: 1, role: "admin" })
// → "auth-service:cache:users:list:<sha256-hash>"
// Deterministic: key order doesn't matter
```

## Invalidation after mutations

```ts
// After updating a user:
const keys = redis.keyBuilder.invalidateById("users", userId)
await redis.invalidate(keys.exact) // exact ID key
await redis.invalidateByPattern(keys.listPattern) // all list caches

// Invalidate all keys for a resource:
await redis.invalidateByPattern(redis.keyBuilder.invalidateAll("users"))

// Nuclear: invalidate everything in this namespace:
await redis.invalidateNamespace()
```

`invalidateByPattern` rejects patterns outside your namespace (safety guard).

## API surface

| Method                                             | Description                    |
| -------------------------------------------------- | ------------------------------ |
| `get<T>(key)`                                      | Get cached value               |
| `set(key, value, { ttl? })`                        | Set value with optional TTL    |
| `getOrSet(key, { fetcher, ttl, fetchTimeoutMs? })` | Cache-aside with single-flight |
| `del(...keys)`                                     | Delete keys                    |
| `exists(key)`                                      | Check if key exists            |
| `invalidate(key)`                                  | Delete single key              |
| `invalidateMany(...keys)`                          | Delete multiple keys           |
| `invalidateByPattern(pattern)`                     | SCAN + DEL (namespace-safe)    |
| `invalidateNamespace()`                            | Delete all keys in namespace   |
| `ping()`                                           | Health check                   |
| `disconnect()`                                     | Close connection               |
| `ttl(key)`                                         | Get remaining TTL              |
| `expire(key, seconds)`                             | Set expiration                 |

## Important: namespace vs BullMQ

The `namespace` only affects cache operations (`get`, `set`, `keyBuilder`). BullMQ queue operations use `redis.client` directly and have their own key format (`bull:*`). Passing a `RedisClient` with namespace `"auth"` to `QueueService` is safe — queue keys are unaffected.
