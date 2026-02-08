import type { RedisOptions } from "ioredis"

// ---------------------------------------------------------------------------
// RedisClient constructor
// ---------------------------------------------------------------------------

export interface RedisClientOptions {
  url: string
  namespace?: string
  redisOptions?: Omit<RedisOptions, "lazyConnect">
}

// ---------------------------------------------------------------------------
// Cache operations
// ---------------------------------------------------------------------------

export interface CacheSetOptions {
  ttl?: number
}

export interface CacheGetOrSetOptions<T> extends CacheSetOptions {
  fetcher: () => T | Promise<T>
}

export interface InvalidateByPatternOptions {
  batchSize?: number
}

// ---------------------------------------------------------------------------
// Distributed lock
// ---------------------------------------------------------------------------

export interface LockOptions {
  /** How long the lock lives in Redis (seconds). Prevents deadlocks. */
  lockTTL?: number
  /** How long to wait for the leader to populate the cache (ms). */
  waitTimeout?: number
  /** Interval between cache-check polls while waiting (ms). */
  retryInterval?: number
}

// ---------------------------------------------------------------------------
// Cache middleware (Express-style)
// ---------------------------------------------------------------------------

/** Minimal Express-like Request — keeps the package framework-agnostic. */
export interface MiddlewareRequest {
  method: string
  originalUrl: string
  path: string
  query: Record<string, unknown>
  params: Record<string, unknown>
  body?: unknown
  [key: string]: unknown
}

/** Minimal Express-like Response. */
export interface MiddlewareResponse {
  status: (code: number) => MiddlewareResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
  [key: string]: unknown
}

/** Express-style next function. */
export type MiddlewareNext = (err?: unknown) => void

export interface CacheMiddlewareOptions<
  Req extends MiddlewareRequest = MiddlewareRequest
> {
  /** Key generator — receives the request, returns a plain cache key. */
  keyGenerator: (req: Req) => string
  /** Cache TTL in seconds. */
  ttl: number
  /** The actual data-fetching function. */
  fetcher: (req: Req) => unknown | Promise<unknown>
  /** Distributed-lock tuning (optional). */
  lock?: LockOptions
}

export interface InvalidateMiddlewareOptions<
  Req extends MiddlewareRequest = MiddlewareRequest
> {
  /** Returns the exact key(s) or glob pattern to invalidate. */
  keyGenerator: (req: Req) => string | string[]
}
