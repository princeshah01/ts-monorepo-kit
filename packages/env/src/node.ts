import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

type Infer<T extends Record<string, z.ZodTypeAny>> = {
  [K in keyof T]: z.infer<T[K]>
}

export function createNodeEnv<TServer extends Record<string, z.ZodTypeAny>>(
  server: TServer
): Infer<TServer> {
  return createEnv({
    server,
    // eslint-disable-next-line no-restricted-properties
    runtimeEnv: process.env,
    emptyStringAsUndefined: true
  }) as Infer<TServer>
}
