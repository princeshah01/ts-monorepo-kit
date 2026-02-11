// ---------------------------------------------------------------------------
// Public API — packages/queue
//
// This barrel file controls what consumers can import.  Internal helpers
// (e.g., dead-letter internals) stay private; only the clean interfaces
// and service classes are exported.
// ---------------------------------------------------------------------------

// ── Services (adapters) ──────────────────────────────────────────────────────
export { QueueService } from "./queue-service.js"
export { WorkerService } from "./worker-service.js"
export { DeadLetterService } from "./dead-letter.js"

// ── Types & Interfaces (ports + contracts) ───────────────────────────────────
export { JobType } from "./types.js"
export type {
  // Job registry
  JobPayloadMap,
  JobHandler,
  JobHandlerRegistry,
  JobContext,

  // Queue port
  IQueueService,
  QueueServiceOptions,
  EnqueueOptions,

  // Worker
  WorkerServiceOptions,

  // Health & metrics
  QueueHealthStatus,
  QueueMetrics,

  // Dead-letter
  DeadLetterEntry
} from "./types.js"
