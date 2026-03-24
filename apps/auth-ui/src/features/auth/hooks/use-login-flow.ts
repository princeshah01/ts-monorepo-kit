import { useState } from "react"

import { findUser } from "../data/mock-auth"
import { loginEmailSchema, loginPasswordSchema } from "../forms/schemas"

type LoginStep = "email" | "password"

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function useLoginFlow() {
  const [step, setStep] = useState<LoginStep>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  )
  const [topError, setTopError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function setEmailValue(value: string) {
    setEmail(value)
    setErrors(prev => ({ ...prev, email: undefined }))
  }

  function setPasswordValue(value: string) {
    setPassword(value)
    setTopError("")
    setErrors(prev => ({ ...prev, password: undefined }))
  }

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

  return {
    step,
    email,
    setEmail,
    setEmailValue,
    password,
    setPassword,
    setPasswordValue,
    errors,
    topError,
    isLoading,
    setStep,
    continueWithEmail,
    login
  }
}
