import type { JobHandler } from "@repo/queue"

export const userOnboardHandler: JobHandler<"user.onboard"> = async (
  payload,
  ctx
) => {
  ctx.logger.info(
    `Onboarding user: id="${payload.userId}" email="${payload.email}" name="${payload.name}"`
  )

  ctx.logger.info(`Sending welcome email to "${payload.email}"`)
  await new Promise(resolve => setTimeout(resolve, 100))

  ctx.logger.info(`Syncing user "${payload.userId}" to CRM`)
  await new Promise(resolve => setTimeout(resolve, 100))

  ctx.logger.info(`Tracking onboarding event for "${payload.userId}"`)
  await new Promise(resolve => setTimeout(resolve, 50))

  ctx.logger.info(`User onboarding complete: id="${payload.userId}"`)
}
