// ---------------------------------------------------------------------------
// Environment validation for the Worker process.
//
// Uses the shared @repo/env package so environment variables are validated
// eagerly at startup — no silent failures buried deep in a handler.
// ---------------------------------------------------------------------------

import { createNodeEnv } from "@repo/env/node"
import { redisUrl, port, nodeEnv } from "@repo/env/schema"

export const env = createNodeEnv({
  NODE_ENV: nodeEnv,
  REDIS_URL: redisUrl,
  /** Port for the HTTP health-check server (optional). */
  WORKER_HEALTH_PORT: port.default(9090),
  /** Worker concurrency — how many jobs to process in parallel. */
  WORKER_CONCURRENCY: port.default(5), // reusing `port` schema for easy coercion
  /** Optional: isolate queue data on a separate Redis DB index. */
  REDIS_QUEUE_DB: port.optional()
})
