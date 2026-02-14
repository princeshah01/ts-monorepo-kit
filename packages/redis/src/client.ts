import { Logger } from "@repo/logger"
import { Redis } from "ioredis"

import { ResourceCacheKeyBuilder } from "./cache-key.js"
import { serialize, deserialize } from "./serializer.js"
import { SingleFlight } from "./single-flight.js"
import type {
  RedisClientOptions,
  CacheSetOptions,
  CacheGetOrSetOptions,
  InvalidateByPatternOptions
} from "./types.js"

export class RedisClient {
  public readonly client: Redis
  private readonly ns: string
  private readonly logger: Logger
  private readonly singleFlight: SingleFlight
  public readonly keyBuilder: ResourceCacheKeyBuilder

  constructor(opts: RedisClientOptions, logger?: Logger) {
    const { url, namespace, redisOptions = {}, cacheKeyPrefix } = opts
    if (!url) {
      throw new Error("Redis url is required.")
    }
    if (!namespace) {
      throw new Error("Redis namespace is required.")
    }
    this.logger = opts.logger ?? logger ?? new Logger(opts.namespace)
    this.client = new Redis(url, {
      ...redisOptions,
      lazyConnect: false,
      maxRetriesPerRequest: redisOptions.maxRetriesPerRequest ?? 3
    })
    this.ns = namespace
    this.singleFlight = new SingleFlight()

    // initialize cache key builder with namespace and optional cache key prefix
    this.keyBuilder = new ResourceCacheKeyBuilder({
      namespace: this.ns,
      cacheKeyPrefix: cacheKeyPrefix ?? "cache"
    })

    // logs for connection and errors
    this.client.on("connect", () => {
      this.logger.info("Redis client connected.")
    })
    this.client.on("error", (err: Error) => {
      this.logger.error(`Redis error: ${err.message}`)
    })
  }

  async disconnect(): Promise<void> {
    this.logger.info("Disconnecting Redis client...")
    await this.client.quit()
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key)
      if (raw === null) {
        return null
      }
      return deserialize<T>(raw)
    } catch (err) {
      this.logger.error(`Redis GET failed for key=${key}`, err)
      return null
    }
  }

  async set<T>(key: string, value: T, opts?: CacheSetOptions): Promise<void> {
    try {
      const data = serialize(value)
      if (opts?.ttl && opts.ttl > 0) {
        await this.client.set(key, data, "EX", opts.ttl)
      } else {
        await this.client.set(key, data)
      }
    } catch (err) {
      this.logger.error(`Redis SET failed for key=${key}`, err)
    }
  }
  // delete keys, return number of deleted keys
  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0
    }
    return this.client.del(...keys)
  }
  // check if key exists, return true if exists, false if not
  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1
  }

  async getOrSet<T>(
    key: string,
    opts: CacheGetOrSetOptions<T>
  ): Promise<T | null> {
    return this.singleFlight.do<T>(key, async () => {
      try {
        const cached = await this.get<T>(key)
        if (cached !== null) {
          this.logger.info(`Cache hit key=${key}`)
          return cached
        }

        this.logger.info(`Cache miss key=${key}`)

        const value = await this.executeFetcherWithTimeout(
          key,
          opts.fetcher,
          opts.fetchTimeoutMs
        )

        if (value === null) {
          this.logger.warn(`Fetcher returned null key=${key}`)
          return null
        }

        await this.set(key, value, { ttl: opts.ttl })
        return value
      } catch (err) {
        this.logger.error(`getOrSet failed key=${key}`, err)
        return null
      }
    })
  }

  // cache invalidation

  async invalidate(key: string): Promise<void> {
    await this.client.del(key)
  }

  async invalidateMany(...keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return
    }
    await this.client.del(...keys)
  }

  async invalidateByPattern(
    pattern: string,
    opts?: InvalidateByPatternOptions
  ): Promise<number> {
    if (!pattern.startsWith(`${this.ns}:`)) {
      throw new Error("Refusing to invalidate keys outside namespace.")
    }
    const batchSize = opts?.batchSize ?? 100
    let cursor = "0"
    let deleted = 0
    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        batchSize
      )
      cursor = nextCursor
      if (keys.length > 0) {
        deleted += await this.client.del(...keys)
      }
    } while (cursor !== "0")
    return deleted
  }

  async invalidateNamespace(): Promise<number> {
    if (!this.ns) {
      throw new Error(
        "Cannot invalidate namespace: no namespace was configured."
      )
    }
    return this.invalidateByPattern(this.keyBuilder.invalidateAll())
  }

  // TTL and expiration

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key)
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    return (await this.client.expire(key, seconds)) === 1
  }

  // Health check

  async ping(): Promise<boolean> {
    try {
      const res = await this.client.ping()
      return res === "PONG"
    } catch {
      return false
    }
  }

  private async executeFetcherWithTimeout<T>(
    key: string,
    fetcher: () => T | null | Promise<T | null>,
    timeoutMs?: number
  ): Promise<T | null> {
    if (!timeoutMs || timeoutMs <= 0) {
      return await fetcher()
    }

    try {
      let timeoutHandle: ReturnType<typeof setTimeout> | null = null

      const timeoutPromise = new Promise<null>(resolve => {
        timeoutHandle = setTimeout(() => {
          this.logger.error(`Fetcher timed out after ${timeoutMs}ms key=${key}`)
          resolve(null)
        }, timeoutMs)
      })

      const fetchPromise = Promise.resolve(fetcher()).finally(() => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle)
        }
      })

      return await Promise.race([fetchPromise, timeoutPromise])
    } catch (err) {
      this.logger.error(`Fetcher failed key=${key}`, err)
      return null
    }
  }
}
