import { InputWrapper } from "./form-field"
import { PasswordInput } from "./password-input"
import { PasswordRequirements } from "./password-requirements"

interface StepFourValues {
  password: string
  confirmPassword: string
}

interface SignupStepFourProps {
  values: StepFourValues
  errors: Partial<Record<keyof StepFourValues, string>>
  onChange: (key: keyof StepFourValues, value: string) => void
}

export function SignupStepFour({
  values,
  errors,
  onChange
}: SignupStepFourProps) {
  return (
    <div className="grid gap-3">
      <InputWrapper
        label="Password"
        htmlFor="signup-password"
        value={values.password}
        onChange={value => onChange("password", value)}
        error={errors.password}
      >
        {field => (
          <PasswordInput
            id={field.id}
            value={values.password}
            onChange={value => onChange("password", value)}
            placeholder="Create password"
            ariaLabel="Toggle password visibility"
            ariaDescribedBy={field.describedBy}
            hasError={field.hasError}
          />
        )}
      </InputWrapper>
      <PasswordRequirements password={values.password} />
      <InputWrapper
        label="Confirm password"
        htmlFor="signup-confirm-password"
        value={values.confirmPassword}
        onChange={value => onChange("confirmPassword", value)}
        error={errors.confirmPassword}
      >
        {field => (
          <PasswordInput
            id={field.id}
            value={values.confirmPassword}
            onChange={value => onChange("confirmPassword", value)}
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
