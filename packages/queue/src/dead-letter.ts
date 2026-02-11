// ---------------------------------------------------------------------------
// Dead-letter queue (DLQ) pattern.
//
// When a job exhausts all retry attempts the WorkerService pushes a
// structured record into a Redis sorted set keyed by failure timestamp.
// This lets ops teams inspect, replay, or purge failed jobs without
// coupling to BullMQ's internal data model.
//
// Why a sorted set?
//   • O(log N) insert.
//   • Range queries by timestamp ("show all failures in the last hour").
//   • Easy ZRANGEBYSCORE for dashboards or replay scripts.
// ---------------------------------------------------------------------------

import type { RedisClient } from "@repo/redis"
import type { Logger } from "@repo/logger"
import type { DeadLetterEntry } from "./types.js"
import { serialize, deserialize } from "@repo/redis"

const DLQ_KEY_PREFIX = "dlq"

export class DeadLetterService {
  private readonly redis: RedisClient
  private readonly logger: Logger
  private readonly dlqKey: string

  constructor(redis: RedisClient, logger: Logger, queueName: string) {
    this.redis = redis
    this.logger = logger
    this.dlqKey = `${DLQ_KEY_PREFIX}:${queueName}`
  }

  // ── Write ──────────────────────────────────────────────────────────

  async add(entry: DeadLetterEntry): Promise<void> {
    const score = Date.now()
    const member = serialize(entry)

    await this.redis.client.zadd(this.dlqKey, score, member)

    this.logger.warn(
      `[DLQ] Job "${entry.jobType}" (id=${entry.jobId}) moved to dead-letter queue. Reason: ${entry.failedReason}`
    )
  }

  // ── Read ───────────────────────────────────────────────────────────

  /**
   * Retrieve dead-letter entries within a time window.
   *
   * @param since  Oldest timestamp to include (epoch ms, default: 0 = all).
   * @param until  Newest timestamp to include (epoch ms, default: now).
   * @param limit  Max entries to return (default: 100).
   */
  async list(
    since = 0,
    until = Date.now(),
    limit = 100
  ): Promise<DeadLetterEntry[]> {
    const raw = await this.redis.client.zrangebyscore(
      this.dlqKey,
      since,
      until,
      "LIMIT",
      0,
      limit
    )

    return raw.map(r => deserialize<DeadLetterEntry>(r))
  }

  /** Count of entries currently in the DLQ. */
  async count(): Promise<number> {
    return this.redis.client.zcard(this.dlqKey)
  }

  // ── Maintenance ────────────────────────────────────────────────────

  /** Remove a specific entry by its serialised member value. */
  async remove(entry: DeadLetterEntry): Promise<boolean> {
    const member = serialize(entry)
    const removed = await this.redis.client.zrem(this.dlqKey, member)
    return removed > 0
  }

  /** Purge entries older than `olderThanMs` milliseconds. */
  async purge(olderThanMs: number): Promise<number> {
    const cutoff = Date.now() - olderThanMs
    return this.redis.client.zremrangebyscore(this.dlqKey, "-inf", cutoff)
  }

  /** Wipe the entire DLQ (use with caution). */
  async clear(): Promise<void> {
    await this.redis.client.del(this.dlqKey)
    this.logger.warn(`[DLQ] Dead-letter queue "${this.dlqKey}" cleared`)
  }
}
