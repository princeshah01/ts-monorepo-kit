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

  const redis = new RedisClient({
    url: env.REDIS_URL,
    namespace: "queue"
  })

  const pong = await redis.ping()
  if (!pong) {
    logger.error("Failed to connect to Redis — aborting.")
    process.exit(1)
  }
  logger.info("Redis connected ✓")

  const queueService = QueueService.create({
    redis,
    logger,
    queueName: env.REDIS_QUEUE_NAME,
    redisDbIndex: env.REDIS_QUEUE_DB
  })

  const workerService = new WorkerService({
    redis,
    handlers,
    logger,
    queueName: env.REDIS_QUEUE_NAME,
    concurrency: env.WORKER_CONCURRENCY,
    redisDbIndex: env.REDIS_QUEUE_DB
  })

  createHealthServer({
    port: env.WORKER_HEALTH_PORT,
    queue: queueService,
    worker: workerService,
    logger
  })

  registerGracefulShutdown({ worker: workerService, redis, logger })

  logger.info("Worker is ready and processing jobs ✓")
}

main().catch(err => {
  console.error("Fatal error during worker bootstrap:", err)
  process.exit(1)
})
