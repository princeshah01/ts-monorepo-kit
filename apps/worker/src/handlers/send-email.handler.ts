import type { JobHandler } from "@repo/queue"

export const sendEmailHandler: JobHandler<"email.send"> = async (
  payload,
  ctx
) => {
  ctx.logger.info(
    `Sending email to="${payload.to}" subject="${payload.subject}"`
  )

  // Simulate latency
  await new Promise(resolve => setTimeout(resolve, 200))

  ctx.logger.info(`Email sent successfully to="${payload.to}"`)
}
