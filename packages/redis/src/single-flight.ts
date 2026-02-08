import type { Redis } from "ioredis"
import { DistributedLock } from "./distributed-lock.js"
import { serialize, deserialize } from "./serializer.js"
import type { LockOptions } from "./types.js"

/*
 *   1.  LocalSingleFlight  — in-memory, per-process dedup (unchanged logic)
 *   If 50 requests hit the SAME Node process at the same instant, only
 *   one of them runs the fetcher. The other 49 await the same Promise.
 *   This is purely a performance optimisation — it does NOT help across
 *   multiple processes / containers.
 */

export class LocalSingleFlight {
  private readonly flights = new Map<string, Promise<unknown>>()

  async do<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.flights.get(key)
    if (existing) return existing as Promise<T>

    const promise = fn().finally(() => {
      this.flights.delete(key)
    })

    this.flights.set(key, promise)
    return promise
  }

  get size(): number {
    return this.flights.size
  }
}
/*
 * 2.  DistributedSingleFlight  — Redis-backed, works across N processes
 *
 *     Combines:
 *       • LocalSingleFlight   →  dedup within the same process (fast path)
 *       • DistributedLock      →  dedup across all processes   (SET NX EX)
 *
 *     Flow for  getOrSet(cacheKey, fetcher):
 *
 *       ┌─ Process A ──────────────────────────────────────────────────┐
 *       │  1. Redis GET cacheKey  →  HIT ? return                      │
 *       │  2. LocalSingleFlight.do(cacheKey, …)                        │
 *       │     └─ 3. SET lock:ns:key NX EX 10  →  acquired? YES         │
 *       │        └─ 4. fetcher()  →  SET cacheKey value  →  DEL lock   │
 *       │                                                              │
 *       ├─ Process B (same instant) ───────────────────────────────────┤
 *       │  1. Redis GET cacheKey  →  MISS                              │
 *       │  2. LocalSingleFlight.do(cacheKey, …)                        │
 *       │     └─ 3. SET lock:ns:key NX EX 10  →  acquired? NO          │
 *       │        └─ 4. poll Redis GET cacheKey until value appears     │
 *       └──────────────────────────────────────────────────────────────┘
 *
 */
const DEFAULT_LOCK_TTL = 10 // seconds
const DEFAULT_WAIT_TIMEOUT = 8_000 // ms
const DEFAULT_RETRY_INTERVAL = 100 // ms

export class DistributedSingleFlight {
  private readonly client: Redis
  private readonly ns: string
  private readonly local: LocalSingleFlight

  constructor(client: Redis, namespace: string) {
    this.client = client
    this.ns = namespace
    this.local = new LocalSingleFlight()
  }

  /**
   * Get-or-set with distributed single-flight.
   *
   * @param cacheKey  Full namespaced cache key  (cache:web:users:42)
   * @param ttl       Cache TTL in seconds
   * @param fetcher   Function that fetches the real data (DB call etc.)
   * @param lockOpts  Optional lock tuning
   */
  async getOrSet<T>(
    cacheKey: string,
    ttl: number,
    fetcher: () => T | Promise<T>,
    lockOpts?: LockOptions
  ): Promise<T> {
    // ── Step 1: cache hit — fastest path ──
    const cached = await this.client.get(cacheKey)
    if (cached !== null) return deserialize<T>(cached)

    // ── Step 2: local dedup (same-process optimisation) ──
    return this.local.do<T>(cacheKey, () =>
      this.acquireAndFetch<T>(cacheKey, ttl, fetcher, lockOpts)
    )
  }

  // -----------------------------------------------------------------------
  // Private: attempt to acquire lock, fetch, or wait
  // -----------------------------------------------------------------------

  private async acquireAndFetch<T>(
    cacheKey: string,
    ttl: number,
    fetcher: () => T | Promise<T>,
    lockOpts?: LockOptions
  ): Promise<T> {
    const lockTTL = lockOpts?.lockTTL ?? DEFAULT_LOCK_TTL
    const waitTimeout = lockOpts?.waitTimeout ?? DEFAULT_WAIT_TIMEOUT
    const retryInterval = lockOpts?.retryInterval ?? DEFAULT_RETRY_INTERVAL

    // Build the lock key:  lock:{namespace}:{strippedCacheKey}
    const lockKey = cacheKey.replace(/^cache:/, "lock:")

    const lock = new DistributedLock(this.client, lockKey, lockTTL)
    const acquired = await lock.tryAcquire()

    if (acquired) {
      // ── I am the leader — fetch, cache, release ──
      try {
        // Double-check: another leader may have finished between our GET
        // and the lock acquisition
        const secondCheck = await this.client.get(cacheKey)
        if (secondCheck !== null) return deserialize<T>(secondCheck)

        const value = await fetcher()
        await this.client.set(cacheKey, serialize(value), "EX", ttl)
        return value
      } finally {
        await lock.release()
      }
    }

    // ── I am a follower — poll until the leader populates the cache ──
    return this.waitForCache<T>(cacheKey, waitTimeout, retryInterval)
  }

  /** Poll Redis until the cache key appears or we time out. */
  private async waitForCache<T>(
    cacheKey: string,
    timeout: number,
    interval: number
  ): Promise<T> {
    const deadline = Date.now() + timeout

    while (Date.now() < deadline) {
      const raw = await this.client.get(cacheKey)
      if (raw !== null) return deserialize<T>(raw)

      // Sleep without blocking the event loop
      await new Promise(r => setTimeout(r, interval))
    }

    // If the leader crashed and the lock expired, we still haven't got
    // data.  Throw so the caller can handle the error (return 503, etc).
    throw new Error(
      `[DistributedSingleFlight] Timed out waiting for cache key: ${cacheKey}`
    )
  }
}
