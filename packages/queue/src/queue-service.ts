// ---------------------------------------------------------------------------
// QueueService — BullMQ adapter implementing the IQueueService port.
//
// Architectural decisions:
//   • Singleton per queue-name per process — prevents duplicate Queue
//     instances that would leak Redis connections.
//   • Accepts an existing RedisClient — never creates its own connections.
//   • Exposes a strongly-typed `enqueue` method that maps JobType → payload.
//   • Default retry strategy: 5 attempts, exponential backoff starting at 2s.
//   • All BullMQ imports are confined to this file + worker-service.ts;
//     nothing else in the monorepo touches BullMQ directly.
// ---------------------------------------------------------------------------

import { Queue } from "bullmq"
import type { RedisClient } from "@repo/redis"
import type { Logger } from "@repo/logger"
import type {
  IQueueService,
  QueueServiceOptions,
  EnqueueOptions,
  JobPayloadMap,
  QueueHealthStatus,
  QueueMetrics
} from "./types.js"

// ── Singleton registry ───────────────────────────────────────────────────────
// One QueueService instance per queue name prevents connection leaks when
// callers inadvertently construct multiple instances.

const instances = new Map<string, QueueService>()

// ── Default job options ──────────────────────────────────────────────────────

const DEFAULT_ATTEMPTS = 5
const DEFAULT_BACKOFF_DELAY = 2_000 // ms – first retry after 2 s
const DEFAULT_REMOVE_ON_COMPLETE = true
const DEFAULT_REMOVE_ON_FAIL = false
const DEFAULT_QUEUE_NAME = "default"

// ---------------------------------------------------------------------------
// QueueService
// ---------------------------------------------------------------------------

export class QueueService implements IQueueService {
  private readonly queue: Queue
  private readonly logger: Logger
  private readonly queueName: string

  // ── Factory (singleton) ──────────────────────────────────────────────

  /**
   * Obtain the singleton `QueueService` for a given queue name.
   *
   * If an instance already exists for that name it is returned as-is.
   * This guarantees exactly one BullMQ `Queue` object per queue name per
   * process, regardless of how many modules call `QueueService.create()`.
   */
  static create(options: QueueServiceOptions): QueueService {
    const name = options.queueName ?? DEFAULT_QUEUE_NAME

    const existing = instances.get(name)
    if (existing) {
      options.logger.info(
        `Returning existing QueueService singleton for queue "${name}"`
      )
      return existing
    }

    const instance = new QueueService(options)
    instances.set(name, instance)
    return instance
  }

  // ── Private constructor — forces callers through `.create()` ───────

  private constructor(options: QueueServiceOptions) {
    const { redis, logger, queueName, redisDbIndex } = options

    this.queueName = queueName ?? DEFAULT_QUEUE_NAME
    this.logger = logger

    // Derive an ioredis-compatible connection from the caller's RedisClient.
    // BullMQ accepts an existing ioredis instance via the `connection` option,
    // so we never open extra connections.
    const connection = this.buildConnection(redis, redisDbIndex)

    this.queue = new Queue(this.queueName, {
      connection,
      defaultJobOptions: {
        attempts: DEFAULT_ATTEMPTS,
        backoff: {
          type: "exponential",
          delay: DEFAULT_BACKOFF_DELAY
        },
        removeOnComplete: DEFAULT_REMOVE_ON_COMPLETE,
        removeOnFail: DEFAULT_REMOVE_ON_FAIL
      }
    })

    this.logger.info(`QueueService initialised for queue "${this.queueName}"`)
  }

  // ── Enqueue ────────────────────────────────────────────────────────

  async enqueue<T extends keyof JobPayloadMap>(
    jobType: T,
    payload: JobPayloadMap[T],
    options?: EnqueueOptions
  ): Promise<string> {
    const job = await this.queue.add(jobType as string, payload, {
      delay: options?.delay,
      priority: options?.priority,
      attempts: options?.attempts ?? DEFAULT_ATTEMPTS,
      backoff: options?.backoff ?? {
        type: "exponential",
        delay: DEFAULT_BACKOFF_DELAY
      },
      jobId: options?.deduplicationId,
      removeOnComplete: options?.removeOnComplete ?? DEFAULT_REMOVE_ON_COMPLETE,
      removeOnFail: options?.removeOnFail ?? DEFAULT_REMOVE_ON_FAIL
    })

    this.logger.info(
      `Enqueued job "${jobType}" with id "${job.id}" on queue "${this.queueName}"`
    )

    // `job.id` is guaranteed by BullMQ to be a non-null string at this point.
    return job.id!
  }

  // ── Bulk enqueue ───────────────────────────────────────────────────

  async enqueueBulk<T extends keyof JobPayloadMap>(
    jobType: T,
    items: Array<{ payload: JobPayloadMap[T]; options?: EnqueueOptions }>
  ): Promise<string[]> {
    const bulkJobs = items.map(item => ({
      name: jobType as string,
      data: item.payload,
      opts: {
        delay: item.options?.delay,
        priority: item.options?.priority,
        attempts: item.options?.attempts ?? DEFAULT_ATTEMPTS,
        backoff: item.options?.backoff ?? {
          type: "exponential" as const,
          delay: DEFAULT_BACKOFF_DELAY
        },
        jobId: item.options?.deduplicationId,
        removeOnComplete:
          item.options?.removeOnComplete ?? DEFAULT_REMOVE_ON_COMPLETE,
        removeOnFail: item.options?.removeOnFail ?? DEFAULT_REMOVE_ON_FAIL
      }
    }))

    const jobs = await this.queue.addBulk(bulkJobs)

    this.logger.info(
      `Bulk-enqueued ${String(jobs.length)} "${jobType}" jobs on queue "${this.queueName}"`
    )

    return jobs.map(j => j.id!)
  }

  // ── Queue controls ─────────────────────────────────────────────────

  async pause(): Promise<void> {
    await this.queue.pause()
    this.logger.info(`Queue "${this.queueName}" paused`)
  }

  async resume(): Promise<void> {
    await this.queue.resume()
    this.logger.info(`Queue "${this.queueName}" resumed`)
  }

  async close(): Promise<void> {
    await this.queue.close()
    instances.delete(this.queueName)
    this.logger.info(`Queue "${this.queueName}" closed`)
  }

  // ── Health check ───────────────────────────────────────────────────

  async healthCheck(): Promise<QueueHealthStatus> {
    try {
      const isPaused = await this.queue.isPaused()
      const counts = await this.queue.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed"
      )

      return {
        connected: true,
        queueName: this.queueName,
        paused: isPaused,
        counts: {
          waiting: counts.waiting ?? 0,
          active: counts.active ?? 0,
          completed: counts.completed ?? 0,
          failed: counts.failed ?? 0,
          delayed: counts.delayed ?? 0
        }
      }
    } catch (err) {
      this.logger.error("Queue health check failed", err)
      return {
        connected: false,
        queueName: this.queueName,
        paused: false,
        counts: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
      }
    }
  }

  // ── Metrics ────────────────────────────────────────────────────────

  async getMetrics(sampleWindowMs = 60_000): Promise<QueueMetrics> {
    const end = Date.now()
    const start = end - sampleWindowMs

    const [completed, failed] = await Promise.all([
      this.queue.getCompleted(0, -1),
      this.queue.getFailed(0, -1)
    ])

    const completedInWindow = completed.filter(
      j => j.finishedOn !== undefined && j.finishedOn >= start
    ).length

    const failedInWindow = failed.filter(
      j => j.finishedOn !== undefined && j.finishedOn >= start
    ).length

    const totalInWindow = completedInWindow + failedInWindow
    const throughput =
      sampleWindowMs > 0 ? totalInWindow / (sampleWindowMs / 1_000) : 0

    return {
      queueName: this.queueName,
      completedCount: completedInWindow,
      failedCount: failedInWindow,
      throughput: Math.round(throughput * 100) / 100,
      collectedAt: new Date(end).toISOString()
    }
  }

  // ── Internals ──────────────────────────────────────────────────────

  /**
   * Build a connection object for BullMQ from the caller's RedisClient.
   *
   * If a separate `redisDbIndex` is requested we duplicate the underlying
   * ioredis instance and SELECT the target DB.  Otherwise we hand off the
   * existing connection directly — zero new TCP sockets.
   */
  private buildConnection(redis: RedisClient, dbIndex?: number) {
    const baseConnection = redis.client

    if (dbIndex !== undefined) {
      // `.duplicate()` creates a new ioredis instance that shares the same
      // connection options but allows us to SELECT a different DB without
      // affecting the caller's original connection.
      const dup = baseConnection.duplicate({ db: dbIndex })
      return dup
    }

    return baseConnection
  }
}
