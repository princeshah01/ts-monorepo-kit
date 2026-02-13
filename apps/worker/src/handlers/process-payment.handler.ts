import type { JobHandler } from "@repo/queue"

export const processPaymentHandler: JobHandler<"payment.process"> = async (
  payload,
  ctx
) => {
  ctx.logger.info(
    `Processing payment: userId="${payload.userId}" amount=${String(payload.amount)} ${payload.currency} idempotencyKey="${payload.idempotencyKey}"`
  )

  // Simulate payment gateway latency
  await new Promise(resolve => setTimeout(resolve, 500))

  ctx.logger.info(
    `Payment processed successfully: userId="${payload.userId}" idempotencyKey="${payload.idempotencyKey}"`
  )
}
