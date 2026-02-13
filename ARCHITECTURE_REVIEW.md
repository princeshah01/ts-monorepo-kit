# Architecture Review -- Senior System Architect

> Reviewer: Senior System Architect (automated review)
> Date: February 13, 2026
> Scope: @repo/redis, @repo/queue, apps/worker, and supporting infrastructure

---

## Overall rating: 9/10

This is a well-engineered, production-aware monorepo foundation. The code is
clean, typed end-to-end, and follows solid separation-of-concerns principles.
Below is a detailed breakdown.

---

## What's done well

### 1. Type safety throughout (10/10)

- `JobPayloadMap` is a single source of truth for all job contracts.
- `JobHandlerRegistry` is strict -- adding a job type without a handler is a
  compile-time error, not a runtime surprise.
- Zod-validated environment variables fail fast at process startup.
- Generic caching methods (`get<T>`, `set<T>`, `getOrSet<T>`) preserve type
  information through the entire call chain.

### 2. Connection management (9/10)

- Redis connections are caller-owned and injected, never created internally.
- BullMQ workers correctly duplicate connections with `maxRetriesPerRequest: null`.
- QueueService is a process-local singleton keyed by `queueName:dbIndex`,
  preventing connection leaks from careless re-instantiation.

### 3. Caching primitives (9/10)

- Cache-aside (`getOrSet`) with single-flight deduplication is the right pattern
  for high-concurrency workloads. Prevents thundering herd on cache miss.
- Namespace-scoped key building is deterministic and collision-safe (SHA-256 for lists).
- `invalidateByPattern` rejects patterns outside the namespace -- a simple but
  effective guardrail against accidental global deletes.
- Fetcher timeout with proper timer cleanup avoids lingering timers on resolution.

### 4. Queue design (9/10)

- BullMQ is the right choice for Redis-backed job processing at this scale.
- Clean separation: API services only see `IQueueService` (the port); BullMQ is
  an implementation detail confined to queue-service.ts and worker-service.ts.
- Retry defaults (5 attempts, exponential backoff from 2s) are sensible for
  transient failures without overwhelming downstream services.
- Dead-letter queue as a Redis sorted set is a smart decoupling from BullMQ
  internals -- it supports time-range queries and independent retention.

### 5. Worker operations (9/10)

- Graceful shutdown handles SIGTERM, SIGINT, uncaughtException, and
  unhandledRejection with a double-call guard.
- Lightweight health server exposes `/health` and `/metrics` without a framework
  dependency -- container-orchestrator friendly.
- Handler files are isolated, pure async functions -- trivially testable.

### 6. Developer experience (8/10)

- `.env.example` files for every app.
- Clear README at every level (root, app, package).
- Shared ESLint and TypeScript configs eliminate boilerplate.
- `REPO_CONTEXT.md` enables onboarding any engineer (or LLM) in minutes.

---

## Areas for improvement

### 1. Testing (missing)

**Priority: High**

No test files exist anywhere. Recommended next steps:

- Unit tests for `ResourceCacheKeyBuilder` (deterministic output, collision safety).
- Unit tests for `SingleFlight` (deduplication behavior, cleanup on rejection).
- Integration tests for `RedisClient` against a test Redis instance.
- Handler tests with mocked `JobContext`.
- Consider vitest for speed in a monorepo context.

### 2. Observability (basic)

**Priority: Medium**

The logger is console-based. For production:

- Structured JSON logging (pino or winston) with correlation IDs.
- OpenTelemetry traces for queue enqueue -> worker process -> handler complete.
- Prometheus-compatible metrics export (instead of scanning completed/failed sets).

### 3. Metrics scaling

**Priority: Medium**

`getMetrics()` scans all completed/failed jobs to filter by time window. At
high throughput (>10k jobs/min) this becomes O(N). Consider:

- BullMQ's built-in metrics (`queue.getMetrics()`) for O(1) counters.
- Exporting counters to an external time-series DB.

### 4. Error typing

**Priority: Low**

All error handlers catch `unknown` or `Error`. Consider a typed error hierarchy
(`QueueError`, `RedisError`, `HandlerError`) for better error discrimination in
monitoring and alerting.

### 5. Auth service

**Priority: Depends on roadmap**

`apps/auth-service/src/` is empty. The planned API endpoints are documented in
the README. Prioritize implementing the queue integration pattern here first
(create RedisClient, create QueueService, enqueue from route handlers) as a
reference implementation.

### 6. DLQ replay

**Priority: Low**

`DeadLetterService` can list and remove entries but has no replay method.
A `replay(entry)` method that re-enqueues the original payload would complete
the operational story.

---

## Security notes

- Redis connections use URL-based auth (standard). Ensure `REDIS_URL` uses
  `rediss://` in production for TLS.
- `serviceToken` and `jwtSecret` schemas enforce min 32 chars -- good baseline.
- No secrets are logged (verified in current codebase).
- Pattern invalidation is namespace-guarded -- prevents lateral key deletion.

---

## Scalability assessment

| Component        | Current capacity      | Scaling path                           |
| ---------------- | --------------------- | -------------------------------------- |
| Redis cache      | Single instance       | Redis Cluster or read replicas         |
| Queue processing | Single worker process | Horizontal: run N worker pods          |
| DLQ              | Redis sorted set      | Monitor `zcard`; archive to DB if >10k |
| Health endpoints | Node HTTP server      | Sufficient for sidecar/probe patterns  |

The architecture supports horizontal scaling of workers out of the box.
QueueService singleton prevents connection leaks even with multiple imports.
Redis DB index isolation means queue and cache traffic won't contend.

---

## Verdict

This is a solid, production-grade foundation. The type safety, connection
management, and operational primitives (health, shutdown, DLQ) are above
average for an early-stage backend monorepo. The main gap is testing -- adding
a test layer would bring this from "good starter" to "confidently deployable."

Recommended next actions (in priority order):

1. Add unit/integration tests for redis and queue packages.
2. Implement auth-service with queue integration as reference.
3. Upgrade logger to structured JSON output.
4. Add DLQ replay method.
5. Move metrics to O(1) counters.
