import type { Logger } from "@repo/logger"
import type { RedisClient } from "@repo/redis"

export interface JobPayloadMap {
  "email.send": {
    to: string
    subject: string
    body: string
    templateId?: string
    metadata?: Record<string, string>
  }
  "email.send-bulk": {
    recipients: Array<{ to: string; subject: string; body: string }>
    templateId?: string
  }
  "payment.process": {
    userId: string
    amount: number
    currency: string
    idempotencyKey: string
  }
  "user.onboard": {
    userId: string
    email: string
    name: string
  }
  "report.generate": {
    reportType: string
    params: Record<string, unknown>
    requestedBy: string
  }
}

export enum JobType {
  EMAIL_SEND = "email.send",
  EMAIL_SEND_BULK = "email.send-bulk",
  PAYMENT_PROCESS = "payment.process",
  USER_ONBOARD = "user.onboard",
  REPORT_GENERATE = "report.generate"
}

export interface EnqueueOptions {
  // Delay in ms before the job becomes eligible for processing (default: 0).
  delay?: number
  // Job priority (lower number = higher priority, default: 5).
  priority?: number
  // Override default retry attempts (default: 5).
  attempts?: number
  // Override default backoff type/delay.
  backoff?: {
    type: "exponential" | "fixed"
    delay: number
  }
  // Optional deduplication key — BullMQ uses this as the job ID.
  deduplicationId?: string
  // Whether to remove the job on completion (default: true).
  removeOnComplete?: boolean
  // Whether to remove the job on failure (default: false).
  removeOnFail?: boolean
}

export interface IQueueService {
  // Enqueue a job with a strongly-typed payload.
  enqueue<T extends keyof JobPayloadMap>(
    jobType: T,
    payload: JobPayloadMap[T],
    options?: EnqueueOptions
  ): Promise<string>

  // Enqueue multiple jobs of the same type atomically.
  enqueueBulk<T extends keyof JobPayloadMap>(
    jobType: T,
    items: Array<{ payload: JobPayloadMap[T]; options?: EnqueueOptions }>
  ): Promise<string[]>

  // Pause the queue (stops workers from picking up new jobs).
  pause(): Promise<void>

  // Resume a paused queue.
  resume(): Promise<void>

  // Gracefully close the queue connection.
  close(): Promise<void>
}

export interface JobContext {
  // Unique job ID assigned by BullMQ (or "unknown" if not available).
  jobId: string
  // Number of attempts made so far (1-based).
  attemptsMade: number
  // Logger scoped to this job.
  logger: Logger
}

export type JobHandler<T extends keyof JobPayloadMap> = (
  payload: JobPayloadMap[T],
  context: JobContext
) => Promise<void>

// Complete handler registry.
//
// Every key is a `JobType` value and every value is the handler function
// that processes that job.  Type-safety is enforced: the handler's payload
// parameter is inferred from `JobPayloadMap[K]`.
export type JobHandlerRegistry = {
  [K in keyof JobPayloadMap]: JobHandler<K>
}
export interface WorkerServiceOptions {
  // Redis client instance (required).
  redis: RedisClient
  // Handler registry — one handler per job type.
  handlers: JobHandlerRegistry
  // Logger instance.
  logger: Logger
  // Queue name (default: "default").
  queueName?: string
  // Number of concurrent jobs to process (default: 5).
  concurrency?: number
  // Optional separate Redis DB index for queue isolation.
  redisDbIndex?: number
  // Stalled-job check interval in ms (default: 30_000).
  stalledInterval?: number
  // Max stalled count before marking a job as failed (default: 2).
  maxStalledCount?: number
  // Rate limiter config — max jobs per duration window.
  rateLimiter?: {
    max: number
    duration: number
  }
  // Retain dead-letter entries for this many ms (default: 7 days).
  dlqRetentionMs?: number
}

export interface QueueServiceOptions {
  // Redis client instance (required).
  redis: RedisClient
  // Logger instance.
  logger: Logger
  // Queue name (default: "default").
  queueName?: string
  // Optional separate Redis DB index for queue isolation.
  redisDbIndex?: number
}

export interface QueueHealthStatus {
  connected: boolean
  queueName: string
  paused: boolean
  counts: {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
  }
}

export interface QueueMetrics {
  queueName: string
  // Total count of jobs currently in the queue (waiting + active + delayed).
  completedCount: number
  // Total count of failed jobs in the queue.
  failedCount: number
  // Approximate throughput (jobs/sec) over the sample window.
  throughput: number
  // Timestamp when metrics were collected.
  collectedAt: string
}

/** DEAD-LETTER QUEUE ENTRY **/
export interface DeadLetterEntry {
  jobId: string
  jobType: string
  payload: unknown
  failedReason: string
  attemptsMade: number
  failedAt: string
  stackTrace?: string
}
