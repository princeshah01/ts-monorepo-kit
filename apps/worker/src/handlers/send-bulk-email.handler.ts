import type { JobHandler } from "@repo/queue"

export const sendBulkEmailHandler: JobHandler<"email.send-bulk"> = async (
  payload,
  ctx
) => {
  ctx.logger.info(
    `Processing bulk email: ${String(payload.recipients.length)} recipients`
  )

  for (const recipient of payload.recipients) {
    ctx.logger.info(
      `Sending to="${recipient.to}" subject="${recipient.subject}"`
    )
    // Replace with actual email provider batch API
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  ctx.logger.info(
    `Bulk email complete: ${String(payload.recipients.length)} emails sent`
  )
}
