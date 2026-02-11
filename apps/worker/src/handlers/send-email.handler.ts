// ---------------------------------------------------------------------------
// Example handler: email.send
//
// Each handler is a standalone async function that receives its
// strongly-typed payload and a `JobContext`.  Handlers are pure — they
// depend only on their arguments, which makes them trivially testable.
//
// In a real app this would call an email provider SDK (SendGrid, AWS SES,
// Resend, etc.).  We keep the example simple on purpose.
// ---------------------------------------------------------------------------

import type { JobHandler } from "@repo/queue"

/**
 * Handle `email.send` jobs.
 *
 * The payload type is inferred from `JobPayloadMap["email.send"]` —
 * no explicit type annotation needed.
 */
export const sendEmailHandler: JobHandler<"email.send"> = async (
  payload,
  ctx
) => {
  ctx.logger.info(
    `Sending email to="${payload.to}" subject="${payload.subject}"`
  )

  // ── Simulate email provider call ──────────────────────────────────
  // Replace this with your actual email SDK integration:
  //
  //   await emailProvider.send({
  //     to: payload.to,
  //     subject: payload.subject,
  //     html: payload.body,
  //     templateId: payload.templateId,
  //   })
  //

  // Simulate latency
  await new Promise(resolve => setTimeout(resolve, 200))

  ctx.logger.info(`Email sent successfully to="${payload.to}"`)
}
