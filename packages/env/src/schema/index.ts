import { z } from "zod"

export const nonEmptyString = z.string().min(1)
export const port = z.coerce.number().int().min(1).max(65535)
export const positiveInt = z.coerce.number().min(1).max(Number.MAX_SAFE_INTEGER)
export const url = z.url()
export const nodeEnv = z.enum(["development", "test", "production"])
export const appEnv = z.enum(["local", "staging", "production"])
export const poolSize = z.coerce.number().int().min(1).max(50)
export const redisDbIndex = z.coerce.number().int().min(0).max(15)
export const serviceToken = z.string().min(32)
export const jwtSecret = z.string().min(32)
