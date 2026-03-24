import { InputWrapper } from "./form-field"

interface LoginStepEmailProps {
  email: string
  onChange: (value: string) => void
  error?: string
}

export function LoginStepEmail({
  email,
  onChange,
  error
}: LoginStepEmailProps) {
  return (
    <InputWrapper
      label="Email"
      htmlFor="login-email"
      type="email"
      value={email}
      onChange={onChange}
      placeholder="Email or phone"
      error={error}
    />
  )
}
