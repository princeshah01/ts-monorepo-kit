import { Button } from "@repo/ui/components/button"

import { InputWrapper } from "./form-field"
import { PasswordInput } from "./password-input"

interface LoginStepPasswordProps {
  password: string
  onChange: (value: string) => void
  error?: string
  onForgotPassword: () => void
}

export function LoginStepPassword({
  password,
  onChange,
  error,
  onForgotPassword
}: LoginStepPasswordProps) {
  return (
    <div className="grid gap-3">
      <InputWrapper label="Password" htmlFor="login-password" error={error}>
        {field => (
          <PasswordInput
            id={field.id}
            value={password}
            onChange={onChange}
            placeholder="Enter password"
            ariaLabel="Toggle password visibility"
            ariaDescribedBy={field.describedBy}
            hasError={field.hasError}
          />
        )}
      </InputWrapper>
      <div className="flex justify-end">
        <Button
          variant="link"
          className="h-auto p-0 text-sm font-semibold text-sky-700 hover:text-sky-800"
          onClick={onForgotPassword}
        >
          Forgot password?
        </Button>
      </div>
    </div>
  )
}
