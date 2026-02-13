# REPO_CONTEXT.md -- Redis + Queue Architecture

> Pass this file to any LLM to give it full context on how the Redis and Queue
> systems work in this monorepo. Updated February 2026.

---

## 1. Repository overview

This is a TypeScript monorepo (Turborepo + pnpm) with:

- **apps/auth-service** -- REST API (placeholder, not yet implemented).
- **apps/worker** -- Background job processor (BullMQ).
- **apps/docs** -- Next.js documentation site.
- **packages/redis** -- ioredis wrapper (`@repo/redis`).
- **packages/queue** -- BullMQ queue + worker + dead-letter (`@repo/queue`).
- **packages/env** -- Zod-validated env vars (`@repo/env`).
- **packages/logger** -- Contextual logger (`@repo/logger`).

---

## 2. @repo/redis -- Redis wrapper

### Purpose

Wraps ioredis into a typed, namespace-scoped client with built-in caching
primitives, key building, single-flight deduplication, and safe invalidation.

### Key files

| File                                  | Role                                      |
| ------------------------------------- | ----------------------------------------- |
| `packages/redis/src/client.ts`        | `RedisClient` class                       |
| `packages/redis/src/cache-key.ts`     | `ResourceCacheKeyBuilder`                 |
| `packages/redis/src/single-flight.ts` | `SingleFlight` (dedup concurrent fetches) |
| `packages/redis/src/serializer.ts`    | `serialize()` / `deserialize()`           |
| `packages/redis/src/types.ts`         | All option/config interfaces              |
| `packages/redis/src/index.ts`         | Public exports                            |

### RedisClient construction

```ts
const redis = new RedisClient({
  url: "redis://localhost:6379",   // required
  namespace: "auth-service",       // required, scopes all keys
  cacheKeyPrefix: "cache",         // optional (default: "cache")
  redisOptions: { ... },           // optional ioredis overrides
  logger: myLogger                 // optional (default: new Logger(namespace))
})
```

- `url` and `namespace` are validated at construction; throws if missing.
- The underlying ioredis client is at `redis.client` (used by queue).
- `lazyConnect: false` -- connects immediately.
- `maxRetriesPerRequest` defaults to 3 (overridable).

### Key building (ResourceCacheKeyBuilder)

Available on `redis.keyBuilder`. Format: `{namespace}:{prefix}:{resource}:{type}:{id|hash}`.

```ts
redis.keyBuilder.cacheKeyById("users", "u_123")
// => "auth-service:cache:users:id:u_123"

redis.keyBuilder.cacheKeyForList("users", { page: 1 })
// => "auth-service:cache:users:list:<sha256-of-query>"

redis.keyBuilder.invalidateById("users", "u_123")
// => { exact: "auth-service:cache:users:id:u_123",
//      listPattern: "auth-service:cache:users:list:*" }

redis.keyBuilder.invalidateAll("users")
// => "auth-service:cache:users:*"

redis.keyBuilder.invalidateAll()
// => "auth-service:cache:*"
```

### Caching API

| Method                                               | Description                              |
| ---------------------------------------------------- | ---------------------------------------- |
| `get<T>(key)`                                        | GET + deserialize; null on miss or error |
| `set<T>(key, value, { ttl? })`                       | SET + serialize; EX if ttl > 0           |
| `getOrSet<T>(key, { fetcher, ttl, fetchTimeoutMs })` | Cache-aside with single-flight           |
| `del(...keys)`                                       | DEL keys                                 |
| `exists(key)`                                        | EXISTS check                             |
| `invalidate(key)`                                    | DEL single key                           |
| `invalidateMany(...keys)`                            | DEL multiple keys                        |
| `invalidateByPattern(pattern, { batchSize })`        | SCAN + DEL (namespace-guarded)           |
| `invalidateNamespace()`                              | Wipe all keys under namespace:prefix:\*  |
| `ttl(key)`                                           | Get remaining TTL                        |
| `expire(key, seconds)`                               | Set expiration                           |
| `ping()`                                             | Health check (PONG)                      |
| `disconnect()`                                       | Graceful quit                            |

### Single-flight

`getOrSet` coalesces concurrent calls for the same key. If 10 requests hit
the same cache miss simultaneously, only 1 fetcher runs; the other 9 await
its result. Implemented via an in-memory Map of Promises.

### Namespace safety

`invalidateByPattern` rejects patterns that don't start with `{namespace}:`,
preventing accidental cross-service key deletion.

---

## 3. @repo/queue -- BullMQ abstraction

### Purpose

Type-safe job enqueueing, worker processing, retry logic, and dead-letter
handling -- all backed by BullMQ with injected Redis.

### Key files

| File                                   | Role                             |
| -------------------------------------- | -------------------------------- |
| `packages/queue/src/types.ts`          | All interfaces, enums, type maps |
| `packages/queue/src/queue-service.ts`  | `QueueService` (producer)        |
| `packages/queue/src/worker-service.ts` | `WorkerService` (consumer)       |
| `packages/queue/src/dead-letter.ts`    | `DeadLetterService`              |
| `packages/queue/src/index.ts`          | Public exports                   |

### Connection strategy

Queue never creates its own Redis connections. Callers pass an existing
`RedisClient` instance. Internally, queue/worker duplicate the ioredis client
with `maxRetriesPerRequest: null` (BullMQ requirement). If `redisDbIndex` is
provided, the duplicate targets that DB for isolation.

```
App creates RedisClient(namespace="queue")
  |
  +---> QueueService.create({ redis, redisDbIndex: 1 })
  |       internally: redis.client.duplicate({ db: 1, maxRetriesPerRequest: null })
  |
  +---> WorkerService({ redis, redisDbIndex: 1 })
          internally: redis.client.duplicate({ db: 1, maxRetriesPerRequest: null })
```

### Job type system

All job payloads are defined in `JobPayloadMap`:

```ts
interface JobPayloadMap {
  "email.send":       { to, subject, body, templateId?, metadata? }
  "email.send-bulk":  { recipients[], templateId? }
  "payment.process":  { userId, amount, currency, idempotencyKey }
  "user.onboard":     { userId, email, name }
  "report.generate":  { reportType, params, requestedBy }
}
```

The `JobType` enum mirrors these keys for convenient referencing.

### Enqueueing (QueueService)

`QueueService` is a process-local singleton keyed by `queueName:dbIndex`.

```ts
const queue = QueueService.create({ redis, logger, queueName: "default", redisDbIndex: 1 })

await queue.enqueue(JobType.EMAIL_SEND, { to: "...", subject: "...", body: "..." })
await queue.enqueue(JobType.PAYMENT_PROCESS, payload, { priority: 1 })
await queue.enqueue(JobType.USER_ONBOARD, payload, { deduplicationId: "onboard:usr_123" })
await queue.enqueueBulk(JobType.EMAIL_SEND, [{ payload: ... }, { payload: ... }])
```

Options: `delay`, `priority`, `attempts`, `backoff`, `deduplicationId`,
`removeOnComplete`, `removeOnFail`.

### Worker processing (WorkerService)

```ts
const worker = new WorkerService({
  redis,
  handlers,
  logger,
  queueName: "default",
  concurrency: 5,
  redisDbIndex: 1,
  dlqRetentionMs: 7 * 24 * 60 * 60 * 1000 // 7 days
})
```

- `handlers` is a **strict** `JobHandlerRegistry` -- every `JobPayloadMap` key
  must have a handler at compile time.
- Each handler receives `(payload, context)` where context has `jobId`,
  `attemptsMade`, and a scoped `Logger`.

### Retry logic

- Default: 5 attempts, exponential backoff starting at 2s.
- Per-job overridable at enqueue time.
- On exhaustion, the job is moved to the dead-letter queue.

### Dead-letter queue (DeadLetterService)

Uses a Redis sorted set (`dlq:{queueName}`) keyed by failure timestamp.

| Method                         | Description                                           |
| ------------------------------ | ----------------------------------------------------- |
| `add(entry)`                   | Insert failed job record; auto-purge if retention set |
| `list(since?, until?, limit?)` | Query by time range                                   |
| `count()`                      | Total DLQ entries                                     |
| `remove(entry)`                | Remove specific entry                                 |
| `purge(olderThanMs)`           | Remove entries older than threshold                   |
| `clear()`                      | Wipe entire DLQ                                       |

Default retention: 7 days (auto-cleaned on each `add()`).

### Health and metrics

`QueueService` exposes:

- `healthCheck()` -- connection status, paused state, job counts.
- `getMetrics(windowMs)` -- throughput, completed/failed in time window.

`WorkerService` exposes:

- `isRunning()` -- whether the BullMQ worker loop is active.
- `close()` -- graceful shutdown (drains in-flight jobs).

---

## 4. Worker app (apps/worker)

### Bootstrap flow

1. Validate env vars via `@repo/env` (fail-fast).
2. Create `RedisClient` with namespace `queue`.
3. Ping Redis; exit if unreachable.
4. Create `QueueService` singleton (for health/metrics).
5. Create `WorkerService` with strict handler registry.
6. Start HTTP health server (`/health`, `/metrics`).
7. Register graceful shutdown (SIGTERM, SIGINT, uncaughtException, unhandledRejection).

### Environment variables

| Variable             | Required | Default | Description                         |
| -------------------- | -------- | ------- | ----------------------------------- |
| `NODE_ENV`           | yes      | --      | `development`, `test`, `production` |
| `REDIS_URL`          | yes      | --      | Redis connection URL                |
| `REDIS_QUEUE_DB`     | no       | --      | Separate DB index for queue (0-15)  |
| `REDIS_QUEUE_NAME`   | no       | `queue` | BullMQ queue name                   |
| `WORKER_CONCURRENCY` | no       | `5`     | Parallel jobs                       |
| `WORKER_HEALTH_PORT` | no       | `9090`  | Health server port                  |

### Handler registry

File: `apps/worker/src/handlers/index.ts`

Maps every `JobType` to a handler function. Adding a new job type without
adding a handler is a **compile-time error**.

Current handlers:

- `send-email.handler.ts`
- `send-bulk-email.handler.ts`
- `process-payment.handler.ts`
- `user-onboard.handler.ts`
- `generate-report.handler.ts`

---

## 5. How to add a new job type

1. Add payload interface to `JobPayloadMap` in `packages/queue/src/types.ts`.
2. Add enum entry to `JobType` in the same file.
3. Create `apps/worker/src/handlers/your-job.handler.ts` implementing `JobHandler<"your.job">`.
4. Wire it in `apps/worker/src/handlers/index.ts` (TypeScript enforces this).
5. Enqueue from any service:
   ```ts
   await queue.enqueue(JobType.YOUR_JOB, { ... })
   ```

---

## 6. How to use Redis caching in a service

```ts
import { RedisClient } from "@repo/redis"

const redis = new RedisClient({ url: env.REDIS_URL, namespace: "auth-service" })

// cache-aside
const user = await redis.getOrSet(redis.keyBuilder.cacheKeyById("users", id), {
  ttl: 300,
  fetcher: () => db.user.findUnique({ where: { id } })
})

// invalidate on mutation
const inv = redis.keyBuilder.invalidateById("users", id)
await redis.invalidate(inv.exact)
await redis.invalidateByPattern(inv.listPattern)
```

---

## 7. Data flow diagram

```
[API Service] --enqueue--> [Redis DB 1] --BullMQ--> [Worker Process]
                                                          |
                                                   [Handler Registry]
                                                          |
                                              success? -> done (remove)
                                              failure? -> retry (up to 5x)
                                              exhausted? -> DLQ (sorted set)
```

---

## 8. Key design decisions

| Decision                                 | Rationale                                                            |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Injected Redis (no hidden connections)   | Caller owns lifecycle; testable                                      |
| Separate DB index for queue              | Logical isolation without extra infra                                |
| Strict handler registry                  | Compile-time safety as jobs grow                                     |
| Namespace-guarded invalidation           | Prevents cross-service key wipes                                     |
| Single-flight on cache miss              | Prevents thundering herd                                             |
| DLQ as Redis sorted set                  | O(log N) insert, time-range queries, decoupled from BullMQ internals |
| 7-day DLQ retention                      | Auto-cleanup with manual replay option                               |
| Process-local singleton for QueueService | Prevents connection leaks from duplicate instances                   |
