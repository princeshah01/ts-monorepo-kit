// ---------------------------------------------------------------------------
// Example handler: user.onboard
//
// Performs post-signup tasks: welcome email, analytics event, CRM sync, etc.
// ---------------------------------------------------------------------------

import type { JobHandler } from "@repo/queue"

export const userOnboardHandler: JobHandler<"user.onboard"> = async (
  payload,
  ctx
) => {
  ctx.logger.info(
    `Onboarding user: id="${payload.userId}" email="${payload.email}" name="${payload.name}"`
  )

  // Step 1: Send welcome email (could enqueue another job instead)
  ctx.logger.info(`Sending welcome email to "${payload.email}"`)
  await new Promise(resolve => setTimeout(resolve, 100))

  // Step 2: Sync to CRM
  ctx.logger.info(`Syncing user "${payload.userId}" to CRM`)
  await new Promise(resolve => setTimeout(resolve, 100))

  // Step 3: Track analytics event
  ctx.logger.info(`Tracking onboarding event for "${payload.userId}"`)
  await new Promise(resolve => setTimeout(resolve, 50))

  ctx.logger.info(`User onboarding complete: id="${payload.userId}"`)
}
