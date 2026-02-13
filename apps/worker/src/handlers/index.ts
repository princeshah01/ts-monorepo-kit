import { JobType } from "@repo/queue"
import type { JobHandlerRegistry } from "@repo/queue"
import { sendEmailHandler } from "./send-email.handler.js"
import { sendBulkEmailHandler } from "./send-bulk-email.handler.js"
import { processPaymentHandler } from "./process-payment.handler.js"
import { userOnboardHandler } from "./user-onboard.handler.js"
import { generateReportHandler } from "./generate-report.handler.js"

// Some Example with basic logging and simulated async work (e.g. API calls, DB ops, etc).

export const handlers: JobHandlerRegistry = {
  [JobType.EMAIL_SEND]: sendEmailHandler,
  [JobType.EMAIL_SEND_BULK]: sendBulkEmailHandler,
  [JobType.PAYMENT_PROCESS]: processPaymentHandler,
  [JobType.USER_ONBOARD]: userOnboardHandler,
  [JobType.REPORT_GENERATE]: generateReportHandler
}
