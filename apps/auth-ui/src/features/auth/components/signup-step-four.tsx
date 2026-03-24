import { FormField } from "./form-field"
import { PasswordInput } from "./password-input"

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
      <FormField
        label="Password"
        htmlFor="signup-password"
        value={values.password}
        onChange={value => onChange("password", value)}
        error={errors.password}
      >
        {field => (
          <PasswordInput
            id={field.id}
            value={field.value}
            onChange={field.onChange}
            placeholder="Create password"
            ariaLabel="Toggle password visibility"
          />
        )}
      </FormField>
      <FormField
        label="Confirm password"
        htmlFor="signup-confirm-password"
        value={values.confirmPassword}
        onChange={value => onChange("confirmPassword", value)}
        error={errors.confirmPassword}
      >
        {field => (
          <PasswordInput
            id={field.id}
            value={field.value}
            onChange={field.onChange}
            placeholder="Confirm password"
            ariaLabel="Toggle confirm password visibility"
          />
        )}
      </FormField>
    </div>
  )
}
