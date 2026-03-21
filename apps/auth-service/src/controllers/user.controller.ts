import type { RequestHandler } from "express"
import { userService } from "../services/user.service.js"

export const listUsers: RequestHandler = (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 10)
    const result = userService.list({ page, limit })
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const getUserById: RequestHandler = (req, res, next) => {
  try {
    const userId = String(req.params.userId)
    const result = userService.getById(userId)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const createUser: RequestHandler = (req, res, next) => {
  try {
    const result = userService.create(req.body)
    res.status(201).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const updateUser: RequestHandler = (req, res, next) => {
  try {
    const userId = String(req.params.userId)
    const result = userService.update(userId, req.body)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const deleteUser: RequestHandler = (req, res, next) => {
  try {
    const userId = String(req.params.userId)
    const result = userService.remove(userId)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}
