import { Router, type Router as ExpressRouter } from "express"
import {
  login,
  logout,
  me,
  refresh,
  register
} from "../controllers/auth.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middleware.js"
import {
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema
} from "../validators/auth.validator.js"

export const authRouter: ExpressRouter = Router()

authRouter.post("/register", validate({ body: registerBodySchema }), register)
authRouter.post("/login", validate({ body: loginBodySchema }), login)
authRouter.post("/refresh", validate({ body: refreshBodySchema }), refresh)
authRouter.post("/logout", validate({ body: logoutBodySchema }), logout)
authRouter.get("/me", requireAuth, me)
