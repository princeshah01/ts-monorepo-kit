import { Router, type Router as ExpressRouter } from "express"
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser
} from "../controllers/user.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middleware.js"
import {
  createUserBodySchema,
  listUsersQuerySchema,
  updateUserBodySchema,
  userIdParamSchema
} from "../validators/user.validator.js"

export const userRouter: ExpressRouter = Router()

userRouter.use(requireAuth)

userRouter.get("/", validate({ query: listUsersQuerySchema }), listUsers)
userRouter.get("/:userId", validate({ params: userIdParamSchema }), getUserById)
userRouter.post("/", validate({ body: createUserBodySchema }), createUser)
userRouter.patch(
  "/:userId",
  validate({ params: userIdParamSchema, body: updateUserBodySchema }),
  updateUser
)
userRouter.delete(
  "/:userId",
  validate({ params: userIdParamSchema }),
  deleteUser
)
