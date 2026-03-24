import { FormField } from "./form-field"

interface StepOneValues {
  firstName: string
  lastName: string
  email: string
}

interface SignupStepOneProps {
  values: StepOneValues
  errors: Partial<Record<keyof StepOneValues, string>>
  onChange: (key: keyof StepOneValues, value: string) => void
}

export function SignupStepOne({
  values,
  errors,
  onChange
}: SignupStepOneProps) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          label="First name"
          htmlFor="signup-first-name"
          value={values.firstName}
          onChange={value => onChange("firstName", value)}
          error={errors.firstName}
        />
        <FormField
          label="Last name"
          htmlFor="signup-last-name"
          value={values.lastName}
          onChange={value => onChange("lastName", value)}
          error={errors.lastName}
        />
      </div>
      <FormField
        label="Email"
        htmlFor="signup-email"
        type="email"
        value={values.email}
        onChange={value => onChange("email", value)}
        error={errors.email}
      />
    </div>
  )
}
