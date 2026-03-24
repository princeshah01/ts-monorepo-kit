import { z } from "zod"

export const loginEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address")
})

export const loginPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least 1 uppercase letter")
    .regex(/[a-z]/, "Password must include at least 1 lowercase letter")
    .regex(/\d/, "Password must include at least 1 number")
    .max(72, "Password is too long")
})

export const signupStepOneSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email address")
})

export const signupStepTwoSchema = z.object({
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required")
})

export const signupStepThreeSchema = z.object({
  otp: z.string().length(6, "Enter a valid 6 digit OTP")
})

export const signupStepFourSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include at least 1 uppercase letter")
      .regex(/[a-z]/, "Password must include at least 1 lowercase letter")
      .regex(/\d/, "Password must include at least 1 number"),
    confirmPassword: z.string().min(8, "Confirm your password")
  })
  .refine(values => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })
