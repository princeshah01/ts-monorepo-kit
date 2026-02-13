# @repo/queue

Minimal, scalable queue setup for jobs and workers in a monorepo.

## Design

- Uses BullMQ for job queueing and processing.
- Queue uses an injected RedisClient instance created by the caller.
- Recommended isolation: same Redis server, separate DB index for queue traffic.
- Jobs are registered by name and type-safe payload.
- Workers are separate processes or modules, each consuming a specific job type.

## Environment

Set these in your service/app environment:

```env
REDIS_URL=redis://localhost:6379
REDIS_NAMESPACE=queue
REDIS_QUEUE_DB=1
```

- `REDIS_URL` is required.
- `REDIS_NAMESPACE` should be set to `queue` for queue operations.
- `REDIS_QUEUE_DB` isolates queue data (recommended).

## Setup (overview)

- Create a dedicated Redis client using your Redis wrapper with namespace `queue`.
- Initialize `QueueService` once at app startup and reuse it for job enqueueing.
- Start `WorkerService` in the worker process with a strict handler registry.
- Keep queue traffic isolated using `REDIS_QUEUE_DB`.

## Example (API bootstrap + enqueue)

```ts
import type { Logger } from "@repo/logger"
import { JobType, QueueService, type IQueueService } from "@repo/queue"
import type { RedisClient } from "@repo/redis"

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

export async function exampleRouteHandler(queue: IQueueService): Promise<void> {
  await queue.enqueue(JobType.EMAIL_SEND, {
    to: "user@example.com",
    subject: "Welcome!",
    body: "<h1>Hello, welcome aboard!</h1>"
  })

  await queue.enqueue(
    JobType.EMAIL_SEND,
    {
      to: "user@example.com",
      subject: "How's it going?",
      body: "<p>Just checking in...</p>"
    },
    { delay: 5 * 60 * 1000 }
  )

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

  await queue.enqueue(
    JobType.USER_ONBOARD,
    {
      userId: "usr_123",
      email: "user@example.com",
      name: "Jane Doe"
    },
    { deduplicationId: "onboard:usr_123" }
  )

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
```

## Adding Jobs and Workers

- Define new job types in `JobPayloadMap` and `JobType` in `src/types.ts`.
- Register new handlers in your worker setup.
- Enqueue jobs from any app using the queue service.

## Notes

- Each worker and queue should use the dedicated `queue` namespace Redis client.
- Use a dedicated Redis DB index for queues (recommended).
- You can run multiple workers for different job types or scale horizontally.
- Dead-letter and metrics support are available via the API.
- DLQ entries are retained for 7 days by default (configurable in WorkerService).

## Validation

```bash
pnpm --filter @repo/queue lint
pnpm --filter @repo/queue check-types
```
