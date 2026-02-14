import type { JobHandlerMap } from "@repo/queue"

/*
 * Here When we are adding a handler make sure to add it to the JobHandlerMap type
 * and also add it to the worker-service.ts file
 */

export const handlers: JobHandlerMap = {
  "email.send": async (payload, logger) => {
    // payload is strictly typed as { to: string; subject: string; body: string }
    logger.info(`Sending email to="${payload.to}" subject="${payload.subject}"`)

    await new Promise(resolve => setTimeout(resolve, 200))

    logger.info(`Email sent to="${payload.to}"`)
  },
  "bulk.email.send": async (payload, logger) => {
    // payload is strictly typed as { to: string; subject: string; body: string }[]
    logger.info(`Sending bulk email to="${payload.length}"`)

    await new Promise(resolve => setTimeout(resolve, 200))

    logger.info(`Bulk email sent to="${payload.length}"`)
  }
}
