import { useState } from "react"

import { findUser } from "../data/mock-auth"
import { loginEmailSchema, loginPasswordSchema } from "../forms/schemas"

type LoginStep =
  | "email"
  | "password"
  | "forgot-password-otp"
  | "forgot-password-new"
  | "forgot-password-success"

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function useLoginFlow() {
  const [step, setStep] = useState<LoginStep>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // Forgot password
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    otp?: string
    newPassword?: string
    confirmNewPassword?: string
  }>({})
  const [topError, setTopError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Handlers
  function setEmailValue(value: string) {
    setEmail(value)
    setErrors(prev => ({ ...prev, email: undefined }))
  }

  function setPasswordValue(value: string) {
    setPassword(value)
    setTopError("")
    setErrors(prev => ({ ...prev, password: undefined }))
  }

  function setOtpValue(value: string) {
    setOtp(value)
    setErrors(prev => ({ ...prev, otp: undefined }))
  }

  function setNewPasswordValue(value: string) {
    setNewPassword(value)
    setErrors(prev => ({ ...prev, newPassword: undefined }))
  }

  function setConfirmNewPasswordValue(value: string) {
    setConfirmNewPassword(value)
    setErrors(prev => ({ ...prev, confirmNewPassword: undefined }))
  }

  // Actions
  async function continueWithEmail() {
    const result = loginEmailSchema.safeParse({ email })
    if (!result.success) {
      setErrors({ email: result.error.flatten().fieldErrors.email?.[0] })
      return false
    }
    setErrors({})
    setTopError("")
    setIsLoading(true)
    await wait(450)
    setIsLoading(false)
    setStep("password")
    return true
  }

  async function login() {
    const result = loginPasswordSchema.safeParse({ password })
    if (!result.success) {
      setErrors({ password: result.error.flatten().fieldErrors.password?.[0] })
      return { unauthorized: false, success: false }
    }
    setErrors({})
    setTopError("")
    setIsLoading(true)
    await wait(500)
    const user = findUser(email)
    setIsLoading(false)
    if (!user || user.password !== password) {
      setErrors({ password: "Invalid credentials" })
      return { unauthorized: false, success: false }
    }
    return { unauthorized: !user.hasPermission, success: user.hasPermission }
  }

  async function requestPasswordResetOtp() {
    setErrors({})
    setTopError("")
    setIsLoading(true)
    await wait(400)
    setIsLoading(false)
    setStep("forgot-password-otp")
    return true
  }

  async function verifyOtpAndContinue() {
    if (otp.length < 6) {
      setErrors({ otp: "Please enter a 6-digit code." })
      return false
    }
    setErrors({})
    setTopError("")
    setIsLoading(true)
    await wait(400)
    setIsLoading(false)
    setStep("forgot-password-new")
    return true
  }

  async function resetPassword() {
    // Basic validation
    if (newPassword.length < 8) {
      setErrors({ newPassword: "Password must be at least 8 characters." })
      return false
    }
    if (newPassword !== confirmNewPassword) {
      setErrors({ confirmNewPassword: "Passwords do not match." })
      return false
    }

    setErrors({})
    setTopError("")
    setIsLoading(true)
    await wait(600)
    setIsLoading(false)
    setStep("forgot-password-success")
    return true
  }

  return {
    step,
    setStep,
    email,
    setEmailValue,
    password,
    setPasswordValue,
    otp,
    setOtpValue,
    newPassword,
    setNewPasswordValue,
    confirmNewPassword,
    setConfirmNewPasswordValue,
    errors,
    topError,
    isLoading,
    continueWithEmail,
    login,
    requestPasswordResetOtp,
    verifyOtpAndContinue,
    resetPassword
  }
}
