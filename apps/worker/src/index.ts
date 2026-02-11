// ---------------------------------------------------------------------------
// Worker process entry point.
//
// This file bootstraps the entire worker:
//   1. Validates environment variables (fail-fast).
//   2. Creates a single RedisClient instance.
//   3. Creates QueueService (for health checks / metrics).
//   4. Creates WorkerService with the handler registry.
//   5. Starts the health-check HTTP server.
//   6. Registers graceful shutdown hooks.
//
// Run with:
//   pnpm --filter @repo/worker dev      (watch mode)
//   pnpm --filter @repo/worker start    (production)
// ---------------------------------------------------------------------------

import { Logger } from "@repo/logger"
import { RedisClient } from "@repo/redis"
import { QueueService, WorkerService } from "@repo/queue"
import { env } from "./env.js"
import { handlers } from "./handlers/index.js"
import { registerGracefulShutdown } from "./shutdown.js"
import { createHealthServer } from "./health-server.js"

async function main(): Promise<void> {
  const logger = new Logger("Worker")

  logger.info("Booting worker process…")

  // ── 1. Redis ──────────────────────────────────────────────────────

  const redis = new RedisClient({
    url: env.REDIS_URL,
    namespace: "worker"
  })

  const pong = await redis.ping()
  if (!pong) {
    logger.error("Failed to connect to Redis — aborting.")
    process.exit(1)
  }
  logger.info("Redis connected ✓")

  // ── 2. QueueService (needed for health/metrics endpoints) ─────────

  const queueService = QueueService.create({
    redis,
    logger,
    queueName: "default",
    redisDbIndex: env.REDIS_QUEUE_DB
  })

  // ── 3. WorkerService ──────────────────────────────────────────────

  const workerService = new WorkerService({
    redis,
    handlers,
    logger,
    queueName: "default",
    concurrency: env.WORKER_CONCURRENCY,
    redisDbIndex: env.REDIS_QUEUE_DB
  })

  // ── 4. Health-check server ────────────────────────────────────────

  createHealthServer({
    port: env.WORKER_HEALTH_PORT,
    queue: queueService,
    worker: workerService,
    logger
  })

  // ── 5. Graceful shutdown ──────────────────────────────────────────

  registerGracefulShutdown({ worker: workerService, redis, logger })

  logger.info("Worker is ready and processing jobs ✓")
}

main().catch(err => {
  console.error("Fatal error during worker bootstrap:", err)
  process.exit(1)
})
