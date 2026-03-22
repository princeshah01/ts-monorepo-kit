import { createNodeEnv } from "@repo/env/node"
import { url, nonEmptyString, nodeEnv, port } from "@repo/env/schema"

export const env = createNodeEnv({
  AUTH_PORT: port,
  NODE_ENV: nodeEnv,
  DATABASE_URL: url,
  REDIS_URL: url,
  JWT_ACCESS_SECRET: nonEmptyString,
  JWT_REFRESH_SECRET: nonEmptyString,
  SESSION_SECRET: nonEmptyString
})
