---
name: queue-patterns
description: |
  How the @repo/queue package works in this repo. BullMQ queue + worker pattern.
  Use when: adding new job types, creating handlers, enqueuing jobs, or debugging queue issues.
---

# Queue Patterns — @repo/queue

## Architecture

```
Any app (producer)                    apps/worker (consumer)
──────────────────                    ──────────────────────
QueueService.addJob() ──► Redis ──► WorkerService ──► handler function
```

- **QueueService** — enqueues jobs (used in any app)
- **WorkerService** — consumes jobs and runs handler functions (runs in `apps/worker`)
- Both use BullMQ under the hood and share the same Redis server + queue name

## Adding a new job type

### Step 1 — Define the payload type

File: `packages/queue/src/types.ts`

```ts
export interface JobPayloadMap {
  "email.send": { to: string; subject: string; body: string }
  "bulk.email.send": { to: string; subject: string; body: string }[]
  // ↓ add new types here
  "your.job": { yourField: string }
}
```

### Step 2 — Add a handler

File: `apps/worker/src/handlers/index.ts`

```ts
export const handlers: JobHandlerMap = {
  // ... existing handlers ...
  "your.job": async (payload, logger) => {
    // payload is strictly typed from JobPayloadMap
    logger.info(`Processing ${payload.yourField}`)
  }
}
```

TypeScript enforces that every key in `JobPayloadMap` has a matching handler.

### Step 3 — Enqueue from any app

```ts
import { QueueService } from "@repo/queue"

const queue = new QueueService({ redis, logger })
await queue.addJob("your.job", { yourField: "value" })

// With delay:
await queue.addJob("your.job", { yourField: "value" }, { delay: 60_000 })
```

## Key details

- `QueueService` uses `redis.client.duplicate()` internally — the RedisClient namespace does NOT affect queue keys
- BullMQ manages its own keys (e.g. `bull:default:*`) — separate from the caching namespace
- The worker creates its own `RedisClient` because it's a separate process
- Queue name is configurable via `QUEUE_NAME` env var (defaults to `"default"`)
- Worker concurrency is configurable via `WORKER_CONCURRENCY` env var

## Worker env

```env
REDIS_URL=redis://localhost:6379
QUEUE_NAME=default
WORKER_CONCURRENCY=3
```
