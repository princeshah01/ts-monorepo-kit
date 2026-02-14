import type { Logger } from "@repo/logger"
import type { RedisClient } from "@repo/redis"

export interface JobPayloadMap {
  "email.send": { to: string; subject: string; body: string }
  "bulk.email.send": { to: string; subject: string; body: string }[]
}

export type JobHandler<T extends keyof JobPayloadMap> = (
  payload: JobPayloadMap[T],
  logger: Logger
) => Promise<void>

export type JobHandlerMap = {
  [K in keyof JobPayloadMap]: JobHandler<K>
}

export interface QueueOptions {
  redis: RedisClient
  logger: Logger
  queueName?: string
}

export interface WorkerOptions {
  redis: RedisClient
  handlers: JobHandlerMap
  logger: Logger
  queueName?: string
  concurrency?: number
}
