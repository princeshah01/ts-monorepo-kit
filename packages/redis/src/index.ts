// Core
export { RedisClient } from "./client.js"

// Distributed primitives
export { DistributedLock } from "./distributed-lock.js"
export { LocalSingleFlight, DistributedSingleFlight } from "./single-flight.js"

// Utilities
export { serialize, deserialize } from "./serializer.js"
export {} from "./cache-key.js"

// Middleware
export { cacheMiddleware, invalidateMiddleware } from "./middleware.js"

// Types
export type {
  RedisClientOptions,
  CacheSetOptions,
  CacheGetOrSetOptions,
  InvalidateByPatternOptions,
  LockOptions,
  CacheMiddlewareOptions,
  InvalidateMiddlewareOptions,
  MiddlewareRequest,
  MiddlewareResponse,
  MiddlewareNext
} from "./types.js"
