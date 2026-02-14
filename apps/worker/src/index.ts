import { Logger } from "@repo/logger"
import { QueueService, WorkerService } from "@repo/queue"
import { RedisClient } from "@repo/redis"

import { env } from "./env.js"
import { handlers } from "./handlers/index.js"

async function main(): Promise<void> {
  const logger = new Logger("Worker")

  logger.info("Starting worker")

  // Connect to Redis
  const redis = new RedisClient({
    url: env.REDIS_URL,
    namespace: "queue"
  })

  const pong = await redis.ping()
  if (!pong) {
    logger.error("Could not connect to Redis - exiting.")
    process.exit(1)
  }
  logger.info("Redis connected ✓")

  // Create queue (for enqueuing from this process if needed)
  const queue = new QueueService({
    redis,
    logger,
    queueName: env.QUEUE_NAME
  })

  // Start worker (picks up jobs and runs handlers)
  const worker = new WorkerService({
    redis,
    logger,
    handlers,
    queueName: env.QUEUE_NAME,
    concurrency: env.WORKER_CONCURRENCY
  })

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received - shutting down`)
    await worker.close()
    await queue.close()
    await redis.disconnect()
    logger.info("Shutdown complete")
    process.exit(0)
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"))
  process.on("SIGINT", () => void shutdown("SIGINT"))

  logger.info("Worker is ready")
}

main().catch(err => {
  console.error("Fatal error:", err)
  process.exit(1)
})
