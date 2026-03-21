import { type RequestHandler } from "express"
import { ZodError, type ZodTypeAny } from "zod"
import { ValidationError } from "../types/errors.js"

interface ValidationSchemas {
  body?: ZodTypeAny
  params?: ZodTypeAny
  query?: ZodTypeAny
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return async (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body)
      }

      if (schemas.params) {
        const parsedParams = await schemas.params.parseAsync(req.params)
        req.params = parsedParams as typeof req.params
      }

      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query)
        req.query = parsedQuery as typeof req.query
      }

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError("Request validation failed", error.flatten()))
        return
      }

      next(error)
    }
  }
}
