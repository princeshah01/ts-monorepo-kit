// ---------------------------------------------------------------------------
// Job handler registry — the wiring layer.
//
// Maps every `JobType` to its handler function.  The worker bootstrap
// passes this registry to `WorkerService` which routes incoming jobs.
//
// When you add a new job:
//   1. Define payload in `JobPayloadMap` (packages/queue/src/types.ts).
//   2. Add enum entry to `JobType`.
//   3. Create a handler file in this folder.
//   4. Wire it here.
//
// The registry is typed against `JobHandlerRegistry` — if you forget to
// handle a registered type, TypeScript won't complain (it's a partial map),
// but at runtime the worker will throw "No handler registered" for that type.
// ---------------------------------------------------------------------------

import { JobType } from "@repo/queue"
import type { JobHandlerRegistry } from "@repo/queue"
import { sendEmailHandler } from "./send-email.handler.js"
import { sendBulkEmailHandler } from "./send-bulk-email.handler.js"
import { processPaymentHandler } from "./process-payment.handler.js"
import { userOnboardHandler } from "./user-onboard.handler.js"
import { generateReportHandler } from "./generate-report.handler.js"

/**
 * Complete handler registry.
 *
 * Every key is a `JobType` value and every value is the handler function
 * that processes that job.  Type-safety is enforced: the handler's payload
 * parameter is inferred from `JobPayloadMap[K]`.
 */
export const handlers: JobHandlerRegistry = {
  [JobType.EMAIL_SEND]: sendEmailHandler,
  [JobType.EMAIL_SEND_BULK]: sendBulkEmailHandler,
  [JobType.PAYMENT_PROCESS]: processPaymentHandler,
  [JobType.USER_ONBOARD]: userOnboardHandler,
  [JobType.REPORT_GENERATE]: generateReportHandler
}
