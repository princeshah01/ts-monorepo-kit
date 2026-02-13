import { Logger } from "@repo/logger"
import type { RedisClient } from "@repo/redis"
import { Worker, type Job } from "bullmq"

import { DeadLetterService } from "./dead-letter.js"
import type {
  WorkerServiceOptions,
  JobPayloadMap,
  JobHandlerRegistry,
  JobContext
} from "./types.js"

const DEFAULT_QUEUE_NAME = "default"
const DEFAULT_CONCURRENCY = 5
const DEFAULT_ATTEMPTS = 5
const DEFAULT_STALLED_INTERVAL = 30_000
const DEFAULT_MAX_STALLED_COUNT = 2
const DEFAULT_DLQ_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

export class WorkerService {
  private readonly worker: Worker
  private readonly logger: Logger
  private readonly handlers: JobHandlerRegistry
  private readonly deadLetter: DeadLetterService
  private readonly queueName: string

  constructor(options: WorkerServiceOptions) {
    const {
      redis,
      handlers,
      logger,
      queueName = DEFAULT_QUEUE_NAME,
      concurrency = DEFAULT_CONCURRENCY,
      redisDbIndex,
      stalledInterval = DEFAULT_STALLED_INTERVAL,
      maxStalledCount = DEFAULT_MAX_STALLED_COUNT,
      rateLimiter,
      dlqRetentionMs = DEFAULT_DLQ_RETENTION_MS
    } = options

    this.queueName = queueName
    this.logger = logger
    this.handlers = handlers

    // Dead-letter service shares the same Redis connection.
    this.deadLetter = new DeadLetterService(
      redis,
      logger,
      queueName,
      dlqRetentionMs
    )

    // Build connection the same way QueueService does.
    const connection = this.buildConnection(redis, redisDbIndex)

    this.worker = new Worker(
      queueName,
      async (job: Job) => this.processJob(job),
      {
        connection,
        concurrency,
        stalledInterval,
        maxStalledCount,
        limiter: rateLimiter
          ? { max: rateLimiter.max, duration: rateLimiter.duration }
          : undefined
      }
    )

    // ── Lifecycle event listeners ──────────────────────────────────

    this.worker.on("completed", (job: Job) => {
      this.logger.info(
        `[Worker] Job completed: type="${job.name}" id="${job.id}" duration=${String(job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : "?")}ms`
      )
    })

    this.worker.on("failed", (job: Job | undefined, err: Error) => {
      const jobId = job?.id ?? "unknown"
      const jobName = job?.name ?? "unknown"
      const attempts = job?.attemptsMade ?? 0

      this.logger.error(
        `[Worker] Job failed: type="${jobName}" id="${jobId}" attempt=${String(attempts)} error="${err.message}"`
      )

      // If the job has exhausted all retries, move it to the dead-letter queue.
      if (job && job.attemptsMade >= (job.opts.attempts ?? DEFAULT_ATTEMPTS)) {
        void this.deadLetter.add({
          jobId: jobId,
          jobType: jobName,
          payload: job.data as unknown,
          failedReason: err.message,
          attemptsMade: attempts,
          failedAt: new Date().toISOString(),
          stackTrace: err.stack
        })
      }
    })

    this.worker.on("stalled", (jobId: string) => {
      this.logger.warn(
        `[Worker] Job stalled: id="${jobId}" on queue "${queueName}"`
      )
    })

    this.worker.on("error", (err: Error) => {
      this.logger.error(`[Worker] Worker error: ${err.message}`)
    })

    this.logger.info(
      `WorkerService started on queue "${queueName}" with concurrency=${String(concurrency)}`
    )
  }

  // ── Job processor ──────────────────────────────────────────────────

  private async processJob(job: Job): Promise<void> {
    const jobType = job.name as keyof JobPayloadMap
    const handler = this.handlers[jobType]

    if (!handler) {
      throw new Error(
        'No handler registered for job type "' +
          String(job.name) +
          '". Register a handler in your JobHandlerRegistry.'
      )
    }

    const context: JobContext = {
      jobId: job.id ?? "unknown",
      attemptsMade: job.attemptsMade,
      logger: new Logger(`Job:${job.name}:${job.id ?? "?"}`)
    }

    this.logger.info(
      `[Worker] Processing job: type="${job.name}" id="${job.id}" attempt=${String(job.attemptsMade + 1)}`
    )

    await (handler as (payload: unknown, ctx: JobContext) => Promise<void>)(
      job.data,
      context
    )
  }

  // ── Graceful shutdown ──────────────────────────────────────────────

  async close(): Promise<void> {
    this.logger.info(
      `[Worker] Shutting down worker on queue "${this.queueName}"…`
    )
    await this.worker.close()
    this.logger.info(`[Worker] Worker on queue "${this.queueName}" stopped`)
  }

  // ── Health ─────────────────────────────────────────────────────────

  isRunning(): boolean {
    return this.worker.isRunning()
  }

  // ── Internals ──────────────────────────────────────────────────────

  private buildConnection(redis: RedisClient, dbIndex?: number) {
    const baseConnection = redis.client

    if (dbIndex !== undefined) {
      return baseConnection.duplicate({
        db: dbIndex,
        maxRetriesPerRequest: null
      })
    }
    return baseConnection.duplicate({ maxRetriesPerRequest: null })
  }
}
