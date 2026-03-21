import type { ErrorRequestHandler, RequestHandler } from "express"
import { AppError, NotFoundError } from "../types/errors.js"

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new NotFoundError(`Route ${req.method} ${req.originalUrl} was not found`)
  )
}

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      }
    })

    return
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  })
}
