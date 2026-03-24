import { InputWrapper } from "./form-field"

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
        <InputWrapper
          label="First name"
          htmlFor="signup-first-name"
          value={values.firstName}
          onChange={value => onChange("firstName", value)}
          placeholder="Enter first name"
          error={errors.firstName}
        />
        <InputWrapper
          label="Last name"
          htmlFor="signup-last-name"
          value={values.lastName}
          onChange={value => onChange("lastName", value)}
          placeholder="Enter last name"
          error={errors.lastName}
        />
      </div>
      <InputWrapper
        label="Email"
        htmlFor="signup-email"
        type="email"
        value={values.email}
        onChange={value => onChange("email", value)}
        placeholder="Enter your email"
        error={errors.email}
      />
    </div>
  )
}
