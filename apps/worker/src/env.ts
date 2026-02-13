import { createNodeEnv } from "@repo/env/node"
import {
  redisUrl,
  redisDbIndex,
  port,
  nodeEnv,
  nonEmptyString,
  number
} from "@repo/env/schema"

export const env = createNodeEnv({
  NODE_ENV: nodeEnv,
  REDIS_URL: redisUrl,
  /** Port for the HTTP health-check server (optional). */
  WORKER_HEALTH_PORT: port.default(9090),
  /** Worker concurrency — how many jobs to process in parallel. */
  WORKER_CONCURRENCY: number.default(5),
  /** Optional: isolate queue data on a separate Redis DB index. */
  REDIS_QUEUE_DB: redisDbIndex.optional(),
  /** Optional: Redis key prefix for the queue (default: "queue"). */
  REDIS_QUEUE_NAME: nonEmptyString.default("queue")
})
