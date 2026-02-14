# @repo/queue

Simple job queue for your monorepo. Uses BullMQ + Redis under the hood.

## How it works

1. **QueueService** — adds jobs to the queue from any app (API, script, etc.)
2. **WorkerService** — picks up jobs and runs your handler functions.

Both connect to the same Redis instance and the same queue name.

## Setup

### 1. Install

Already included in the monorepo. Add to your app's `package.json`:

```json
{
  "dependencies": {
    "@repo/queue": "workspace:*",
    "@repo/redis": "workspace:*"
  }
}
```

Then run `pnpm install` from the repo root.

### 2. Define job types

Open `packages/queue/src/types.ts` and add your job to `JobPayloadMap`:

```ts
export interface JobPayloadMap {
  "email.send": { to: string; subject: string; body: string }
  "bulk.email.send": { to: string; subject: string; body: string }[]
  // ↓ add new job types here
  "user.onboard": { userId: string; plan: string }
}
```

This gives you strict typing everywhere — both when enqueuing and when handling.

### 3. Add a handler in the worker

Open `apps/worker/src/handlers/index.ts` and add a handler for your new job:

```ts
import type { JobHandlerMap } from "@repo/queue"

export const handlers: JobHandlerMap = {
  "email.send": async (payload, logger) => {
    logger.info(`Sending email to="${payload.to}" subject="${payload.subject}"`)
    // ... your email logic
  },

  "bulk.email.send": async (payload, logger) => {
    logger.info(`Sending ${payload.length} emails`)
    // ... your bulk email logic
  },

  // ↓ add new handlers here
  "user.onboard": async (payload, logger) => {
    logger.info(`Onboarding user ${payload.userId} on plan ${payload.plan}`)
    // ... your onboarding logic
  }
}
```

> **Every job type in `JobPayloadMap` must have a matching handler.** TypeScript will
> error if you miss one.

### 4. Enqueue jobs from your app (API, controller, etc.)

```ts
import { QueueService } from "@repo/queue"
import { RedisClient } from "@repo/redis"
import { Logger } from "@repo/logger"

// Create instances (typically done once at app startup)
const logger = new Logger("AuthService")
const redis = new RedisClient({
  url: process.env.REDIS_URL!,
  namespace: "auth"
})
const queue = new QueueService({ redis, logger })

// Add a job — fully type-safe
await queue.addJob("email.send", {
  to: "user@example.com",
  subject: "Welcome!",
  body: "Thanks for signing up."
})

// Delayed job (runs after 1 minute)
await queue.addJob(
  "user.onboard",
  { userId: "u_123", plan: "pro" },
  { delay: 60_000 }
)
```

### 5. Start the worker

```bash
cp apps/worker/.env.example apps/worker/.env
pnpm --filter @repo/worker dev
```

The worker will pick up jobs and run your handlers.

## Adding a new job type (summary)

| Step | Where                               | What                                     |
| ---- | ----------------------------------- | ---------------------------------------- |
| 1    | `packages/queue/src/types.ts`       | Add entry to `JobPayloadMap`             |
| 2    | `apps/worker/src/handlers/index.ts` | Add matching handler function            |
| 3    | Your app                            | Call `queue.addJob("job-name", payload)` |

## API

### `QueueService`

| Method                                            | Description                       |
| ------------------------------------------------- | --------------------------------- |
| `new QueueService({ redis, logger, queueName? })` | Create a queue producer           |
| `addJob(name, payload, options?)`                 | Enqueue a job. Returns the job ID |
| `close()`                                         | Gracefully close the connection   |

**`addJob` options:**

| Option  | Type     | Description                            |
| ------- | -------- | -------------------------------------- |
| `delay` | `number` | Milliseconds to wait before processing |

### `WorkerService`

| Method                                                                     | Description                   |
| -------------------------------------------------------------------------- | ----------------------------- |
| `new WorkerService({ redis, logger, handlers, queueName?, concurrency? })` | Start consuming jobs          |
| `isRunning()`                                                              | Check if the worker is active |
| `close()`                                                                  | Stop the worker gracefully    |

## Environment

Your worker app needs:

```env
REDIS_URL=redis://localhost:6379
QUEUE_NAME=default
WORKER_CONCURRENCY=3
```

## Validation

```bash
pnpm --filter @repo/queue check-types
pnpm --filter @repo/queue lint
```
