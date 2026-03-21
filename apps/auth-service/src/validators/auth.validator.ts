import { z } from "zod"

export const registerBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100)
})

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100)
})

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(20)
})

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(20)
})
