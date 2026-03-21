import type { UserRecord } from "./domain.js"

declare global {
  namespace Express {
    interface Request {
      authUser?: UserRecord
      authToken?: string
    }
  }
}

export {}
