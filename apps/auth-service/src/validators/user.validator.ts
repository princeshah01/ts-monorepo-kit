import { z } from "zod"

export const userIdParamSchema = z.object({
  userId: z.uuid()
})

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
})

export const createUserBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  role: z.enum(["admin", "member"]).optional(),
  status: z.enum(["active", "disabled"]).optional()
})

export const updateUserBodySchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    role: z.enum(["admin", "member"]).optional(),
    status: z.enum(["active", "disabled"]).optional()
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required"
  })
