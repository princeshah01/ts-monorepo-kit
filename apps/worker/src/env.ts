import { createNodeEnv } from "@repo/env/node"
import { url, nonEmptyString, poolSize } from "@repo/env/schema"

export const env = createNodeEnv({
  REDIS_URL: url,
  QUEUE_NAME: nonEmptyString,
  WORKER_CONCURRENCY: poolSize
})
