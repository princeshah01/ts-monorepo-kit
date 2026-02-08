import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

type Infer<T extends Record<string, z.ZodTypeAny>> = {
  [K in keyof T]: z.infer<T[K]>
}

export function createReactEnv<
  TClient extends Record<`VITE_${string}`, z.ZodTypeAny>,
  TServer extends Record<string, z.ZodTypeAny> = Record<string, never>
>(opts: {
  client: TClient
  server?: TServer
}): Infer<TClient> & Infer<TServer> {
  return createEnv({
    client: opts.client,
    server: opts.server ?? ({} as TServer),
    clientPrefix: "VITE_",
    runtimeEnv: process.env,
    emptyStringAsUndefined: true
  }) as Infer<TClient> & Infer<TServer>
}
