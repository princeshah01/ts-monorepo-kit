import { InputWrapper } from "./form-field"
import { PasswordInput } from "./password-input"
import { PasswordRequirements } from "./password-requirements"

interface PasswordSetupStepProps {
  passwordValue: string
  onPasswordChange: (value: string) => void
  passwordError?: string
  confirmPasswordValue: string
  onConfirmPasswordChange: (value: string) => void
  confirmPasswordError?: string
}

export function PasswordSetupStep({
  passwordValue,
  onPasswordChange,
  passwordError,
  confirmPasswordValue,
  onConfirmPasswordChange,
  confirmPasswordError
}: PasswordSetupStepProps) {
  return (
    <div className="grid gap-3">
      <InputWrapper
        label="Password"
        htmlFor="setup-password"
        error={passwordError}
      >
        {field => (
          <PasswordInput
            id={field.id}
            value={passwordValue}
            onChange={onPasswordChange}
            placeholder="Create password"
            ariaLabel="Toggle password visibility"
            ariaDescribedBy={field.describedBy}
            hasError={field.hasError}
          />
        )}
      </InputWrapper>
      <PasswordRequirements password={passwordValue} />
      <InputWrapper
        label="Confirm password"
        htmlFor="setup-confirm-password"
        error={confirmPasswordError}
      >
        {field => (
          <PasswordInput
            id={field.id}
            value={confirmPasswordValue}
            onChange={onConfirmPasswordChange}
            placeholder="Confirm password"
            ariaLabel="Toggle confirm password visibility"
            ariaDescribedBy={field.describedBy}
            hasError={field.hasError}
          />
        )}
      </InputWrapper>
    </div>
  )
}
