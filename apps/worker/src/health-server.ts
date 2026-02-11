// ---------------------------------------------------------------------------
// Optional: Lightweight HTTP health-check server for the worker.
//
// Kubernetes readiness/liveness probes and container orchestrators expect
// an HTTP endpoint.  This exposes:
//
//   GET /health   → 200 { status: "ok", worker: true, queue: { … } }
//   GET /metrics  → 200 { throughput, completedCount, failedCount, … }
//
// The server is intentionally minimal — no Express, no framework.
// ---------------------------------------------------------------------------

import { createServer, type Server } from "node:http"
import type { Logger } from "@repo/logger"
import type { QueueService, WorkerService } from "@repo/queue"

interface HealthServerOptions {
  port: number
  queue: QueueService
  worker: WorkerService
  logger: Logger
}

export function createHealthServer(options: HealthServerOptions): Server {
  const { port, queue, worker, logger } = options

  const server = createServer(async (req, res) => {
    const url = req.url ?? "/"

    try {
      if (url === "/health") {
        const health = await queue.healthCheck()
        const isRunning = worker.isRunning()

        const status = health.connected && isRunning ? 200 : 503
        res.writeHead(status, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            status: status === 200 ? "ok" : "degraded",
            worker: isRunning,
            queue: health
          })
        )
        return
      }

      if (url === "/metrics") {
        const metrics = await queue.getMetrics()
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(metrics))
        return
      }

      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Not Found" }))
    } catch (err) {
      logger.error("[HealthServer] Error handling request:", err)
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Internal Server Error" }))
    }
  })

  server.listen(port, () => {
    logger.info(`[HealthServer] Listening on port ${String(port)}`)
  })

  return server
}
