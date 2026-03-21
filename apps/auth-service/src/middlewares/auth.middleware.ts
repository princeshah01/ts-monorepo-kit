import type { RequestHandler } from "express"
import { authService } from "../services/auth.service.js"
import { UnauthorizedError } from "../types/errors.js"

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : undefined

  if (!token) {
    next(new UnauthorizedError("Missing bearer token"))
    return
  }

  const user = authService.validateAccessToken(token)

  if (!user) {
    next(new UnauthorizedError("Invalid or expired access token"))
    return
  }

  req.authToken = token
  req.authUser = user
  next()
}
