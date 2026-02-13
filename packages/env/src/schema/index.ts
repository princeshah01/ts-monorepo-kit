import { z } from "zod"

// Common types
export const nonEmptyString = z.string().min(1)
export const url = z.url().min(1)
export const port = z.coerce.number().int().min(1).max(65535)
// can be used for any numeric env var that must be a positive integer, such as TTLs, batch sizes, etc.
export const number = z.coerce.number().min(1).max(Number.MAX_SAFE_INTEGER)
// Environments

export const nodeEnv = z.enum(["development", "test", "production"])

// Application environments

export const appEnv = z.enum(["local", "staging", "production"])

// Database environments

export const databaseUrl = url
export const databasePoolSize = z.coerce.number().int().min(1).max(50)

// Cache / message broker environments

export const redisUrl = url
export const redisDbIndex = z.coerce.number().int().min(0).max(15)
export const rabbitMqUrl = url

// Authentication / Authorization

export const serviceToken = z.string().min(32)
export const jwtSecret = z.string().min(32)
