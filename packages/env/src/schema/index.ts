import { z } from "zod"

// Common types
export const nonEmptyString = z.string().min(1)
export const url = z.string().url()
export const port = z.coerce.number().int().min(1).max(65535)

// Environments

export const nodeEnv = z.enum(["development", "test", "production"])

// Application environments

export const appEnv = z.enum(["local", "staging", "production"])

// Database environments

export const databaseUrl = url
export const databasePoolSize = z.coerce.number().int().min(1).max(50)

// Cache / message broker environments

export const redisUrl = url
export const rabbitMqUrl = url

// Authentication / Authorization

export const serviceToken = z.string().min(32)
export const jwtSecret = z.string().min(32)
