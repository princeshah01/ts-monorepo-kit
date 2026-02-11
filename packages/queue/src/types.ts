// ---------------------------------------------------------------------------
// Type definitions for the queue package.
//
// Architectural note: All types are defined in a single file to serve as the
// "contract" layer.  Business logic depends ONLY on these interfaces, never
// on BullMQ types directly.  This makes swapping the underlying engine
// (SQS, Kafka, etc.) a matter of re-implementing the interfaces without
// touching any consumer code.
// ---------------------------------------------------------------------------

import type { Logger } from "@repo/logger"
import type { RedisClient } from "@repo/redis"

// ---------------------------------------------------------------------------
// Job registry — the single source of truth for every job the system handles.
//
// To add a new job:
//   1. Add an entry to the `JobPayloadMap` interface.
//   2. Add a matching value to the `JobType` enum.
//   3. Create a handler in `apps/worker/src/handlers/`.
// ---------------------------------------------------------------------------

/**
 * Map every `JobType` to its strongly-typed payload.
 * Extend this interface whenever you introduce a new background job.
 */
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

/**
 * Enum that mirrors the keys of `JobPayloadMap`.
 * Using an enum (rather than raw strings) gives us auto-complete, rename
 * support, and exhaustiveness checking in switch statements.
 */
export enum JobType {
  EMAIL_SEND = "email.send",
  EMAIL_SEND_BULK = "email.send-bulk",
  PAYMENT_PROCESS = "payment.process",
  USER_ONBOARD = "user.onboard",
  REPORT_GENERATE = "report.generate"
}

// ---------------------------------------------------------------------------
// Enqueue options
// ---------------------------------------------------------------------------

export interface EnqueueOptions {
  /** Delay before the job becomes available (milliseconds). */
  delay?: number
  /** Lower number = higher priority (1 is highest). */
  priority?: number
  /** Override default retry attempts (default: 5). */
  attempts?: number
  /** Override default backoff type/delay. */
  backoff?: {
    type: "exponential" | "fixed"
    delay: number
  }
  /** Optional deduplication key — BullMQ uses this as the job ID. */
  deduplicationId?: string
  /** Whether to remove the job on completion (default: true). */
  removeOnComplete?: boolean
  /** Whether to remove the job on failure (default: false). */
  removeOnFail?: boolean
}

// ---------------------------------------------------------------------------
// Queue service interface (port in clean-architecture terms)
// ---------------------------------------------------------------------------

/**
 * Abstract queue port.
 *
 * Any adapter (BullMQ, SQS, Kafka) must implement this interface.
 * API services depend ONLY on `IQueueService`, never on BullMQ directly.
 */
export interface IQueueService {
  /**
   * Enqueue a job with a strongly-typed payload.
   *
   * @example
   * ```ts
   * await queue.enqueue(JobType.EMAIL_SEND, {
   *   to: "user@example.com",
   *   subject: "Welcome!",
   *   body: "<h1>Hello</h1>",
   * })
   * ```
   */
  enqueue<T extends keyof JobPayloadMap>(
    jobType: T,
    payload: JobPayloadMap[T],
    options?: EnqueueOptions
  ): Promise<string>

  /** Enqueue multiple jobs of the same type atomically. */
  enqueueBulk<T extends keyof JobPayloadMap>(
    jobType: T,
    items: Array<{ payload: JobPayloadMap[T]; options?: EnqueueOptions }>
  ): Promise<string[]>

  /** Pause the queue (stops workers from picking up new jobs). */
  pause(): Promise<void>

  /** Resume a paused queue. */
  resume(): Promise<void>

  /** Gracefully close the queue connection. */
  close(): Promise<void>
}

// ---------------------------------------------------------------------------
// Worker types
// ---------------------------------------------------------------------------

/** Context injected into every job handler. */
export interface JobContext {
  /** Unique job ID assigned by the queue engine. */
  jobId: string
  /** Number of attempts made so far (1-based). */
  attemptsMade: number
  /** Logger scoped to this job. */
  logger: Logger
}

/**
 * A job handler function.  Each `JobType` maps to exactly one handler.
 * Handlers are pure functions: receive payload + context, return void.
 */
export type JobHandler<T extends keyof JobPayloadMap> = (
  payload: JobPayloadMap[T],
  context: JobContext
) => Promise<void>

/**
 * Registry mapping every known job type to its handler.
 * The worker uses this at bootstrap to wire up processors.
 */
export type JobHandlerRegistry = {
  [K in keyof JobPayloadMap]?: JobHandler<K>
}

// ---------------------------------------------------------------------------
// Worker service options
// ---------------------------------------------------------------------------

export interface WorkerServiceOptions {
  /** Existing RedisClient to reuse the connection. */
  redis: RedisClient
  /** Handler registry — one handler per job type. */
  handlers: JobHandlerRegistry
  /** Logger instance. */
  logger: Logger
  /** Queue name (default: "default"). */
  queueName?: string
  /** Number of concurrent jobs to process (default: 5). */
  concurrency?: number
  /** Optional separate Redis DB index for queue isolation. */
  redisDbIndex?: number
  /** Stalled-job check interval in ms (default: 30_000). */
  stalledInterval?: number
  /** Max stalled count before marking a job as failed (default: 2). */
  maxStalledCount?: number
  /** Rate limiter config — max jobs per duration window. */
  rateLimiter?: {
    max: number
    duration: number
  }
}

// ---------------------------------------------------------------------------
// Queue service options
// ---------------------------------------------------------------------------

export interface QueueServiceOptions {
  /** Existing RedisClient to reuse the connection. */
  redis: RedisClient
  /** Logger instance. */
  logger: Logger
  /** Queue name (default: "default"). */
  queueName?: string
  /** Optional separate Redis DB index for queue isolation. */
  redisDbIndex?: number
}

// ---------------------------------------------------------------------------
// Health & Metrics
// ---------------------------------------------------------------------------

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
  /** Jobs completed in the last `sampleWindow` ms. */
  completedCount: number
  /** Jobs failed in the last `sampleWindow` ms. */
  failedCount: number
  /** Approximate throughput (jobs/sec) over the sample window. */
  throughput: number
  /** Timestamp when metrics were collected. */
  collectedAt: string
}

// ---------------------------------------------------------------------------
// Dead-letter queue
// ---------------------------------------------------------------------------

export interface DeadLetterEntry {
  jobId: string
  jobType: string
  payload: unknown
  failedReason: string
  attemptsMade: number
  failedAt: string
  stackTrace?: string
}
