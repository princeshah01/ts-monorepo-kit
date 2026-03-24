import { useMemo, useState } from "react"

import {
  signupStepFourSchema,
  signupStepOneSchema,
  signupStepThreeSchema,
  signupStepTwoSchema
} from "../forms/schemas"

type SignupStep = 1 | 2 | 3 | 4

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface SignupValues {
  firstName: string
  lastName: string
  email: string
  dob: string
  gender: string
  otp: string
  password: string
  confirmPassword: string
}

const initialValues: SignupValues = {
  firstName: "",
  lastName: "",
  email: "",
  dob: "",
  gender: "",
  otp: "",
  password: "",
  confirmPassword: ""
}

export function useSignupFlow() {
  const [step, setStep] = useState<SignupStep>(1)
  const [values, setValues] = useState<SignupValues>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [topError, setTopError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const left = useMemo(() => {
    if (step === 1)
      return ["Create account", "Enter your basic information to get started."]
    if (step === 2)
      return ["Additional information", "Add date of birth and gender."]
    if (step === 3)
      return ["Email verification", "Confirm your email with OTP."]
    return ["Set password", "Create a strong password to protect your account."]
  }, [step])

  function update<K extends keyof SignupValues>(
    key: K,
    value: SignupValues[K]
  ) {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  async function nextStep() {
    const parser =
      step === 1
        ? signupStepOneSchema
        : step === 2
          ? signupStepTwoSchema
          : step === 3
            ? signupStepThreeSchema
            : signupStepFourSchema

    const result = parser.safeParse(values)
    if (!result.success) {
      const next: Record<string, string> = {}
      for (const [key, value] of Object.entries(
        result.error.flatten().fieldErrors
      )) {
        if (value?.[0]) next[key] = value[0]
      }
      setErrors(next)
      return false
    }

    setErrors({})
    setTopError("")
    if (step < 4) {
      setStep(prev => (prev + 1) as SignupStep)
      return false
    }

    setIsLoading(true)
    await wait(700)
    setIsLoading(false)
    return true
  }

  return {
    step,
    setStep,
    values,
    errors,
    topError,
    isLoading,
    left,
    update,
    nextStep
  }
}
