import type { RequestHandler } from "express"
import { authService } from "../services/auth.service.js"
import { UnauthorizedError } from "../types/errors.js"

export const register: RequestHandler = (req, res, next) => {
  try {
    const result = authService.register(req.body)
    res.status(201).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const login: RequestHandler = (req, res, next) => {
  try {
    const result = authService.login(req.body)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const refresh: RequestHandler = (req, res, next) => {
  try {
    const result = authService.refresh(req.body)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const logout: RequestHandler = (req, res, next) => {
  try {
    const result = authService.logout(req.body)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const me: RequestHandler = (req, res, next) => {
  try {
    if (!req.authUser) {
      throw new UnauthorizedError("No authenticated user in request")
    }

    const user = authService.me(req.authUser.id)
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}
