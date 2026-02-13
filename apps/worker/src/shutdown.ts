import type { Logger } from "@repo/logger"
import type { WorkerService } from "@repo/queue"
import type { RedisClient } from "@repo/redis"

interface ShutdownDeps {
  worker: WorkerService
  redis: RedisClient
  logger: Logger
}

export function registerGracefulShutdown(deps: ShutdownDeps): void {
  const { worker, redis, logger } = deps
  let shuttingDown = false

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      logger.warn(`[Shutdown] Already shutting down, ignoring ${signal}`)
      return
    }
    shuttingDown = true

    logger.info(`[Shutdown] Received ${signal} — starting graceful shutdown…`)

    try {
      logger.info("[Shutdown] Closing worker…")
      await worker.close()
      logger.info("[Shutdown] Disconnecting Redis…")
      await redis.disconnect()
      logger.info("[Shutdown] Graceful shutdown complete ✓")
      process.exit(0)
    } catch (err) {
      logger.error("[Shutdown] Error during shutdown:", err)
      process.exit(1)
    }
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"))
  process.on("SIGINT", () => void shutdown("SIGINT"))

  process.on("uncaughtException", err => {
    logger.error("[Worker] Uncaught exception:", err)
    void shutdown("uncaughtException")
  })

  process.on("unhandledRejection", reason => {
    logger.error("[Worker] Unhandled rejection:", reason)
    void shutdown("unhandledRejection")
  })
}
