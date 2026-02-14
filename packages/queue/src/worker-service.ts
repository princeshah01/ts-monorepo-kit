import { Logger } from "@repo/logger"
import { Worker, type Job } from "bullmq"

import type { WorkerOptions, JobPayloadMap } from "./types.js"

const DEFAULT_QUEUE_NAME = "default"
const DEFAULT_CONCURRENCY = 3

export class WorkerService {
  private readonly worker: Worker
  private readonly logger: Logger
  private readonly handlers: WorkerOptions["handlers"]

  constructor(options: WorkerOptions) {
    const {
      redis,
      handlers,
      logger,
      queueName = DEFAULT_QUEUE_NAME,
      concurrency = DEFAULT_CONCURRENCY
    } = options

    this.logger = logger
    this.handlers = handlers

    const connection = redis.client.duplicate({ maxRetriesPerRequest: null })

    this.worker = new Worker(
      queueName,
      async (job: Job) => this.processJob(job),
      { connection, concurrency }
    )

    this.worker.on("completed", (job: Job) => {
      this.logger.info(`Job done: name="${job.name}" id="${job.id}"`)
    })

    this.worker.on("failed", (job: Job | undefined, err: Error) => {
      this.logger.error(
        `Job failed: name="${job?.name ?? "?"}" id="${job?.id ?? "?"}" error="${err.message}"`
      )
    })

    this.worker.on("error", (err: Error) => {
      this.logger.error(`Worker error: ${err.message}`)
    })

    this.logger.info(
      `Worker started on queue "${queueName}" (concurrency=${String(concurrency)})`
    )
  }

  private async processJob(job: Job): Promise<void> {
    const jobType = job.name as keyof JobPayloadMap
    const handler = this.handlers[jobType]

    if (!handler) {
      throw new Error(
        `No handler for job "${job.name}". Add it to your handlers map.`
      )
    }

    const jobLogger = new Logger(`Job:${job.name}:${job.id ?? "?"}`)

    this.logger.info(`Processing job: name="${job.name}" id="${job.id}"`)

    await ( handler as (
        payload: JobPayloadMap[keyof JobPayloadMap],
        logger: Logger
      ) => Promise<void> )(job.data, jobLogger)
  }

  isRunning(): boolean {
    return this.worker.isRunning()
  }

  async close(): Promise<void> {
    await this.worker.close()
    this.logger.info("Worker stopped")
  }
}
