import type { RedisClient } from "./client.js"
import type {
  CacheMiddlewareOptions,
  InvalidateMiddlewareOptions,
  MiddlewareRequest,
  MiddlewareResponse,
  MiddlewareNext
} from "./types.js"

// ---------------------------------------------------------------------------
// Cache middleware  — wraps a fetcher with distributed single-flight caching.
//
//  Usage (Express):
//
//    app.get("/users/:id", cacheMiddleware(redis, {
//      keyGenerator: (req) => `users:${req.params.id}`,
//      ttl: 300,
//      fetcher: async (req) => db.user.findUnique({ where: { id: req.params.id } }),
//    }))
//
//  What happens on each request:
//    1. Build the full cache key  →  cache:web:users:42
//    2. Call  redis.getOrSetDistributed()  which handles:
//         • cache hit   → return instantly
//         • cache miss  → distributed lock → only 1 fetcher globally
//    3. Respond with JSON + X-Cache header (HIT or MISS)
// ---------------------------------------------------------------------------

export function cacheMiddleware<
  Req extends MiddlewareRequest = MiddlewareRequest
>(redis: RedisClient, opts: CacheMiddlewareOptions<Req>) {
  const { keyGenerator, ttl, fetcher, lock } = opts

  return async (req: Req, res: MiddlewareResponse, next: MiddlewareNext) => {
    try {
      const plainKey = keyGenerator(req)
      const fullKey = redis.cacheKey(plainKey)

      // Check if value already cached (for the X-Cache header)
      const preCheck = await redis.get(fullKey)
      const isHit = preCheck !== null

      const data = await redis.getOrSetDistributed(fullKey, {
        ttl,
        fetcher: () => fetcher(req),
        lock
      })

      res.setHeader("X-Cache", isHit ? "HIT" : "MISS")
      res.status(200).json(data)
    } catch (err) {
      next(err)
    }
  }
}

// ---------------------------------------------------------------------------
// Invalidate middleware  — deletes cache entries on mutating requests.
//
//  Usage (Express):
//
//    app.put("/users/:id", invalidateMiddleware(redis, {
//      keyGenerator: (req) => `users:${req.params.id}`,
//    }), updateUserHandler)
//
//    Also supports patterns:
//    app.delete("/users/:id", invalidateMiddleware(redis, {
//      keyGenerator: (req) => [`users:${req.params.id}`, `users:list:*`],
//    }), deleteUserHandler)
// ---------------------------------------------------------------------------

export function invalidateMiddleware<
  Req extends MiddlewareRequest = MiddlewareRequest
>(redis: RedisClient, opts: InvalidateMiddlewareOptions<Req>) {
  const { keyGenerator } = opts

  return async (req: Req, _res: MiddlewareResponse, next: MiddlewareNext) => {
    try {
      const keys = keyGenerator(req)
      const keyList = Array.isArray(keys) ? keys : [keys]

      for (const k of keyList) {
        const fullKey = redis.cacheKey(k)

        if (k.includes("*")) {
          // Pattern invalidation  (e.g. users:list:*)
          await redis.invalidateByPattern(fullKey)
        } else {
          // Exact key invalidation
          await redis.invalidate(fullKey)
        }
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}
