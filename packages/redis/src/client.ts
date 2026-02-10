import { Redis } from "ioredis"
import { DistributedSingleFlight } from "./single-flight.js"
import { serialize, deserialize } from "./serializer.js"
import type {
  RedisClientOptions,
  CacheSetOptions,
  CacheGetOrSetOptions,
  InvalidateByPatternOptions,
  LockOptions
} from "./types.js"

/**
 * Shared Redis client for any Turborepo app.
 *
 * Create ONE instance per app and pass it explicitly everywhere:
 *
 *   const redis = new RedisClient({
 *     url: process.env.REDIS_URL!,
 *     namespace: "web",
 *   })
 */

export class RedisClient {
  public readonly client: Redis
  private readonly ns: string
  private readonly distributedFlight: DistributedSingleFlight

  constructor(opts: RedisClientOptions) {
    const { url, namespace = "", redisOptions = {} } = opts
    this.client = new Redis(url, {
      ...redisOptions,
      lazyConnect: false,
      maxRetriesPerRequest: redisOptions.maxRetriesPerRequest ?? 3
    })
    this.ns = namespace
    this.distributedFlight = new DistributedSingleFlight(this.client, this.ns)
    this.client.on("error", (err: Error) => {
      console.error(`[RedisClient:${this.ns || "default"}] ${String(err)}`)
    })
  }

  // ── Lifecycle ──────────────────────────────────────────────────────

  async disconnect(): Promise<void> {
    await this.client.quit()
  }

  // ── Key builders ───────────────────────────────────────────────────
  //  cache:web:users:42   →  cacheKey("users", "42")
  //  lock:web:users:42    →  lockKey("users", "42")
  //  web:users:42         →  key("users", "42")

  key(...parts: string[]): string {
    return this.ns ? `${this.ns}:${parts.join(":")}` : parts.join(":")
  }

  cacheKey(...parts: string[]): string {
    return this.ns
      ? `cache:${this.ns}:${parts.join(":")}`
      : `cache:${parts.join(":")}`
  }

  lockKey(...parts: string[]): string {
    return this.ns
      ? `lock:${this.ns}:${parts.join(":")}`
      : `lock:${parts.join(":")}`
  }

  // ── Basic cache operations ─────────────────────────────────────────

  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.client.get(key)
    if (raw === null) return null
    return deserialize<T>(raw)
  }

  async set<T>(key: string, value: T, opts?: CacheSetOptions): Promise<void> {
    const data = serialize(value)
    if (opts?.ttl && opts.ttl > 0) {
      await this.client.set(key, data, "EX", opts.ttl)
    } else {
      await this.client.set(key, data)
    }
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0
    return this.client.del(...keys)
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1
  }

  // ── Single-flight get-or-set (in-process ONLY — original helper) ───

  async getOrSet<T>(key: string, opts: CacheGetOrSetOptions<T>): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached
    // falls through to local-only single-flight (kept for simple use cases)
    const value = await opts.fetcher()
    await this.set(key, value, { ttl: opts.ttl })
    return value
  }

  // ── Distributed single-flight get-or-set ───────────────────────────
  //  This is the PRIMARY method for horizontally-scaled apps.
  //  Under N concurrent requests across M processes, ONLY ONE globally
  //  executes the fetcher.  All others wait and read from Redis.

  async getOrSetDistributed<T>(
    key: string,
    opts: CacheGetOrSetOptions<T> & { lock?: LockOptions }
  ): Promise<T> {
    return this.distributedFlight.getOrSet<T>(
      key,
      opts.ttl ?? 60,
      opts.fetcher,
      opts.lock
    )
  }

  // ── Cache invalidation ─────────────────────────────────────────────

  async invalidate(key: string): Promise<void> {
    await this.client.del(key)
  }
  async invalidateMany(...keys: string[]): Promise<void> {
    if (keys.length === 0) return
    await this.client.del(...keys)
  }

  async invalidateByPattern(
    pattern: string,
    opts?: InvalidateByPatternOptions
  ): Promise<number> {
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
    return this.invalidateByPattern(`cache:${this.ns}:*`)
  }

  // ── TTL management ─────────────────────────────────────────────────

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key)
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    return (await this.client.expire(key, seconds)) === 1
  }

  // ── Health ─────────────────────────────────────────────────────────

  async ping(): Promise<boolean> {
    try {
      const res = await this.client.ping()
      return res === "PONG"
    } catch {
      return false
    }
  }
}
