import type { Redis } from "ioredis"
import { randomBytes } from "node:crypto"

// ---------------------------------------------------------------------------
// Distributed lock using  SET key value NX EX ttl
//
// How it works:
//   1. tryAcquire() sets a key ONLY if it does NOT already exist (NX).
//      The key auto-expires after `ttl` seconds (EX) to prevent deadlocks
//      if the holder crashes.
//   2. release() deletes the key ONLY if the stored value matches the
//      random token that this instance created.  This prevents one process
//      from accidentally releasing another process's lock.
//
// Key format:   lock:{namespace}:{name}
// ---------------------------------------------------------------------------

export class DistributedLock {
  private readonly client: Redis
  private readonly lockKey: string
  private readonly token: string // unique per lock instance
  private readonly ttl: number // seconds

  constructor(client: Redis, lockKey: string, ttlSeconds: number) {
    this.client = client
    this.lockKey = lockKey
    this.token = randomBytes(16).toString("hex") // unique owner id
    this.ttl = ttlSeconds
  }

  /** Try to acquire the lock. Returns `true` if this instance now holds it. */
  async tryAcquire(): Promise<boolean> {
    //  SET lockKey token NX EX ttl
    //  NX → only set if key does NOT exist
    //  EX → auto-expire after `ttl` seconds (deadlock safety)
    const result = await this.client.set(
      this.lockKey,
      this.token,
      "EX",
      this.ttl,
      "NX"
    )
    return result === "OK"
  }

  async release(): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `
    const result = await this.client.eval(script, 1, this.lockKey, this.token)
    return Number(result) === 1
  }
}
