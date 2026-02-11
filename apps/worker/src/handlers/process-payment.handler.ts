// ---------------------------------------------------------------------------
// Example handler: payment.process
//
// Demonstrates idempotency-key handling and structured error reporting.
// In production this would call Stripe, Adyen, or your payment gateway.
// ---------------------------------------------------------------------------

import type { JobHandler } from "@repo/queue"

export const processPaymentHandler: JobHandler<"payment.process"> = async (
  payload,
  ctx
) => {
  ctx.logger.info(
    `Processing payment: userId="${payload.userId}" amount=${String(payload.amount)} ${payload.currency} idempotencyKey="${payload.idempotencyKey}"`
  )

  // ── Idempotency check ─────────────────────────────────────────────
  // In a real implementation you'd check your database or payment
  // provider for an existing transaction with this idempotency key.

  // Simulate payment gateway latency
  await new Promise(resolve => setTimeout(resolve, 500))

  ctx.logger.info(
    `Payment processed successfully: userId="${payload.userId}" idempotencyKey="${payload.idempotencyKey}"`
  )
}
