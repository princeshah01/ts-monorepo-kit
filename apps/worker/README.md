# @repo/worker

Background job processor for the monorepo. Consumes BullMQ jobs and processes them with registered handlers.

## Environment

Copy the example and fill in values:

```bash
cp .env.example .env
```

See [.env.example](.env.example) for all variables.

## How it works

1. Boots a single `RedisClient` with namespace `queue`.
2. Creates a `QueueService` singleton (used for health checks and metrics).
3. Creates a `WorkerService` with the strict handler registry.
4. Starts a lightweight HTTP health-check server.
5. Registers graceful shutdown hooks (SIGTERM, SIGINT).

## Handler registry

All handlers live in `src/handlers/`. The registry in `src/handlers/index.ts` maps every `JobType` to its handler. This is a **strict** mapping — missing handlers are a compile-time error.

### Current handlers

| Job type          | Handler file                 | Description                    |
| ----------------- | ---------------------------- | ------------------------------ |
| `email.send`      | `send-email.handler.ts`      | Send a single email            |
| `email.send-bulk` | `send-bulk-email.handler.ts` | Send bulk emails               |
| `payment.process` | `process-payment.handler.ts` | Process a payment (idempotent) |
| `user.onboard`    | `user-onboard.handler.ts`    | Post-signup onboarding flow    |
| `report.generate` | `generate-report.handler.ts` | Generate and upload a report   |

### Adding a new handler

1. Add payload to `JobPayloadMap` in `packages/queue/src/types.ts`.
2. Add enum entry to `JobType`.
3. Create `src/handlers/your-handler.handler.ts`.
4. Wire it in `src/handlers/index.ts`.

## Health endpoints

| Endpoint       | Description                                    |
| -------------- | ---------------------------------------------- |
| `GET /health`  | Worker + queue connectivity and job counts     |
| `GET /metrics` | Throughput, completed/failed counts (last 60s) |

## Scripts

```bash
pnpm --filter @repo/worker dev          # watch mode
pnpm --filter @repo/worker build        # compile
pnpm --filter @repo/worker lint         # lint
pnpm --filter @repo/worker check-types  # type-check
```
