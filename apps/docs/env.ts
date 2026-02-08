import { createNextEnv } from "@repo/env/next"
import { nodeEnv, nonEmptyString } from "@repo/env/schema"

export const env = createNextEnv({
  server: {
    NODE_ENV: nodeEnv,
    DATABASE_URL: nonEmptyString
  },
  client: {
    NEXT_PUBLIC_APP_URL: nonEmptyString
  }
})
