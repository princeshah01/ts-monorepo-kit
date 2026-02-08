import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

type Infer<T extends Record<string, z.ZodTypeAny>> = {
  [K in keyof T]: z.infer<T[K]>
}

export function createNextEnv<
  TServer extends Record<string, z.ZodTypeAny>,
  TClient extends Record<`NEXT_PUBLIC_${string}`, z.ZodTypeAny>
>(opts: { server: TServer; client: TClient }): Infer<TServer> & Infer<TClient> {
  return createEnv({
    server: opts.server,
    client: opts.client,
    runtimeEnv: {
      // eslint-disable-next-line no-restricted-properties
      ...process.env
    }
  }) as Infer<TServer> & Infer<TClient>
}
