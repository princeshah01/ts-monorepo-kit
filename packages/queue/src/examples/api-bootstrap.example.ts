// ---------------------------------------------------------------------------
// API-side queue bootstrap example.
//
// This file shows how an API service (e.g., apps/auth-service or any
// Express/Fastify app) would integrate the queue package.
//
// Key points:
//   • The API only depends on `IQueueService` (the port), never on BullMQ.
//   • `QueueService.create()` is called ONCE at app startup and the
//     resulting instance is injected wherever needed.
//   • Business logic calls `queue.enqueue(JobType.X, payload)` — that's it.
//
// Usage:
//   import { createQueueService } from "./queue-bootstrap.js"
//   const queue = createQueueService(redis, logger)
//
//   // In a route handler:
//   await queue.enqueue(JobType.EMAIL_SEND, {
//     to: user.email,
//     subject: "Welcome!",
//     body: "<h1>Hello</h1>",
//   })
// ---------------------------------------------------------------------------

import type { RedisClient } from "@repo/redis"
import type { Logger } from "@repo/logger"
import { QueueService, JobType } from "@repo/queue"
import type { IQueueService } from "@repo/queue"

/**
 * Create and return the queue service singleton.
 *
 * Call this once during app bootstrap.  The returned instance implements
 * `IQueueService`, so your business logic never knows it's BullMQ under
 * the hood.
 */
export function createQueueService(
  redis: RedisClient,
  logger: Logger,
  options?: { queueName?: string; redisDbIndex?: number }
): IQueueService {
  return QueueService.create({
    redis,
    logger,
    queueName: options?.queueName ?? "default",
    redisDbIndex: options?.redisDbIndex
  })
}

// ---------------------------------------------------------------------------
// Example: Using the queue in a route handler
// ---------------------------------------------------------------------------

/**
 * Demonstrates how a controller / route handler would enqueue jobs.
 *
 * The handler receives `IQueueService` via dependency injection (typically
 * through your DI container or simply by passing it from the bootstrap).
 */
export async function exampleRouteHandler(queue: IQueueService): Promise<void> {
  // ── Simple job ────────────────────────────────────────────────────
  await queue.enqueue(JobType.EMAIL_SEND, {
    to: "user@example.com",
    subject: "Welcome!",
    body: "<h1>Hello, welcome aboard!</h1>"
  })

  // ── Delayed job (send in 5 minutes) ───────────────────────────────
  await queue.enqueue(
    JobType.EMAIL_SEND,
    {
      to: "user@example.com",
      subject: "How's it going?",
      body: "<p>Just checking in…</p>"
    },
    { delay: 5 * 60 * 1_000 }
  )

  // ── Priority job (urgent payment) ─────────────────────────────────
  await queue.enqueue(
    JobType.PAYMENT_PROCESS,
    {
      userId: "usr_123",
      amount: 4999,
      currency: "USD",
      idempotencyKey: "pay_abc123"
    },
    { priority: 1 }
  )

  // ── Deduplicated job (only one onboarding per user) ───────────────
  await queue.enqueue(
    JobType.USER_ONBOARD,
    {
      userId: "usr_123",
      email: "user@example.com",
      name: "Jane Doe"
    },
    { deduplicationId: "onboard:usr_123" }
  )

  // ── Bulk enqueue ──────────────────────────────────────────────────
  await queue.enqueueBulk(JobType.EMAIL_SEND, [
    {
      payload: {
        to: "alice@example.com",
        subject: "Digest",
        body: "<p>Your weekly digest</p>"
      }
    },
    {
      payload: {
        to: "bob@example.com",
        subject: "Digest",
        body: "<p>Your weekly digest</p>"
      }
    }
  ])
}
