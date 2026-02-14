import type { Logger } from "@repo/logger"
import { Queue } from "bullmq"

import type { QueueOptions, JobPayloadMap } from "./types.js"

const DEFAULT_QUEUE_NAME = "default"

export class QueueService {
  private readonly queue: Queue
  private readonly logger: Logger

  constructor(options: QueueOptions) {
    const { redis, logger, queueName = DEFAULT_QUEUE_NAME } = options

    this.logger = logger
    const connection = redis.client.duplicate({ maxRetriesPerRequest: null })
    this.queue = new Queue(queueName, { connection })

    this.logger.info(`Queue "${queueName}" ready`)
  }

  async addJob<T extends keyof JobPayloadMap>(
    name: T,
    payload: JobPayloadMap[T],
    options?: { delay?: number }
  ): Promise<string> {
    const job = await this.queue.add(name as string, payload, {
      delay: options?.delay,
      removeOnComplete: true,
      removeOnFail: false
    })

    this.logger.info(`Job added: name="${String(name)}" id="${job.id}"`)

    return job.id!
  }

  async close(): Promise<void> {
    await this.queue.close()
    this.logger.info("Queue closed")
  }
}
