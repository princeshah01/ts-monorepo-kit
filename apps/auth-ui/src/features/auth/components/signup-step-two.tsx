import { InputWrapper } from "./form-field"
import { GenderDropdown } from "./gender-dropdown"
import { SignupDatePicker } from "./signup-date-picker"

interface StepTwoValues {
  dob: string
  gender: string
}

interface SignupStepTwoProps {
  values: StepTwoValues
  errors: Partial<Record<keyof StepTwoValues, string>>
  onChange: (key: keyof StepTwoValues, value: string) => void
}

export function SignupStepTwo({
  values,
  errors,
  onChange
}: SignupStepTwoProps) {
  return (
    <div className="grid gap-3">
      <InputWrapper label="Date of birth" htmlFor="signup-dob" error={errors.dob}>
        {field => (
          <SignupDatePicker
            value={values.dob}
            onChange={value => onChange("dob", value)}
            hasError={field.hasError}
            describedBy={field.describedBy}
          />
        )}
      </InputWrapper>
      <InputWrapper label="Gender" htmlFor="signup-gender" error={errors.gender}>
        {field => (
          <GenderDropdown
            value={values.gender}
            onChange={value => onChange("gender", value)}
            hasError={field.hasError}
            describedBy={field.describedBy}
          />
        )}
      </InputWrapper>
    </div>
  )
}
