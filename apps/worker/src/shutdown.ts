// ---------------------------------------------------------------------------
// Graceful shutdown helper.
//
// Coordinates SIGTERM / SIGINT handling so the worker:
//   1. Stops accepting new jobs.
//   2. Waits for in-flight jobs to drain.
//   3. Closes Redis connections.
//   4. Exits with code 0.
//
// This is critical in containerised / Kubernetes environments where a
// SIGTERM is sent before the pod is killed.  Without graceful shutdown
// you'd get stalled jobs that must be retried.
// ---------------------------------------------------------------------------

import type { Logger } from "@repo/logger"
import type { WorkerService } from "@repo/queue"
import type { RedisClient } from "@repo/redis"

interface ShutdownDeps {
  worker: WorkerService
  redis: RedisClient
  logger: Logger
}

/**
 * Register SIGTERM and SIGINT handlers that gracefully drain the worker.
 *
 * Safe to call multiple times — subsequent signals during an ongoing
 * shutdown are ignored to prevent double-close errors.
 */
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
      // 1. Stop the worker (drains in-flight jobs).
      logger.info("[Shutdown] Closing worker…")
      await worker.close()

      // 2. Disconnect Redis.
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

  // Handle uncaught errors so the worker doesn't silently die.
  process.on("uncaughtException", err => {
    logger.error("[Worker] Uncaught exception:", err)
    void shutdown("uncaughtException")
  })

  process.on("unhandledRejection", reason => {
    logger.error("[Worker] Unhandled rejection:", reason)
    void shutdown("unhandledRejection")
  })
}
