import type { Logger } from "@repo/logger"
import type { RedisOptions } from "ioredis"

export interface RedisClientOptions {
  url: string
  namespace: string
  logger?: Logger
  cacheKeyPrefix?: string
  redisOptions?: Omit<RedisOptions, "lazyConnect">
}
export interface CacheSetOptions {
  ttl?: number
}
export interface CacheGetOrSetOptions<T> extends CacheSetOptions {
  fetcher: () => T | null | Promise<T | null>
  fetchTimeoutMs?: number
}

export interface InvalidateByPatternOptions {
  batchSize?: number
}
