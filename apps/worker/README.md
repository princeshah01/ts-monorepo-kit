# Worker

Background job processor. Picks up jobs from the BullMQ queue and runs your handlers.

## Setup

```bash
cp apps/worker/.env.example apps/worker/.env
```

### Environment variables

| Variable             | Type          | Default | Description             |
| -------------------- | ------------- | ------- | ----------------------- |
| `REDIS_URL`          | URL           | —       | Redis connection string |
| `QUEUE_NAME`         | string        | —       | Queue name to listen on |
| `WORKER_CONCURRENCY` | number (1–50) | —       | Max parallel jobs       |

## Run

```bash
pnpm --filter @repo/worker dev
```

## How it works

1. Connects to Redis
2. Creates a `QueueService` (for enqueuing from this process if needed)
3. Creates a `WorkerService` with your handler map
4. Listens for jobs and dispatches them to the matching handler
5. Handles graceful shutdown on `SIGTERM` / `SIGINT`

## Adding a new job handler

### Step 1 — Define the job type

Open `packages/queue/src/types.ts` and add to `JobPayloadMap`:

```ts
export interface JobPayloadMap {
  "email.send": { to: string; subject: string; body: string }
  "bulk.email.send": { to: string; subject: string; body: string }[]
  // ↓ add your new type here
  "report.generate": { reportId: string; format: "pdf" | "csv" }
}
```

### Step 2 — Add the handler

Open `apps/worker/src/handlers/index.ts`:

```ts
import type { JobHandlerMap } from "@repo/queue"

export const handlers: JobHandlerMap = {
  "email.send": async (payload, logger) => {
    logger.info(`Sending email to="${payload.to}"`)
    // ... your logic
  },

  "bulk.email.send": async (payload, logger) => {
    logger.info(`Sending ${payload.length} emails`)
    // ... your logic
  },

  // ↓ add your new handler here
  "report.generate": async (payload, logger) => {
    logger.info(`Generating ${payload.format} report ${payload.reportId}`)
    // ... your logic
  }
}
```

### Step 3 — Enqueue from any app

```ts
await queue.addJob("report.generate", {
  reportId: "rpt_123",
  format: "pdf"
})
```

> **TypeScript will enforce** that every job in `JobPayloadMap` has a handler, and that
> the payload you pass to `addJob` matches the type definition.

## Scripts

```bash
pnpm --filter @repo/worker dev          # start in dev mode (with tsx watch)
pnpm --filter @repo/worker build        # compile TypeScript
pnpm --filter @repo/worker lint         # lint
pnpm --filter @repo/worker check-types  # type-check
```
