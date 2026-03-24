import { FormField } from "./form-field"
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
      <FormField label="Date of birth" htmlFor="signup-dob" error={errors.dob}>
        <div id="signup-dob">
          <SignupDatePicker
            value={values.dob}
            onChange={value => onChange("dob", value)}
          />
        </div>
      </FormField>
      <FormField label="Gender" htmlFor="signup-gender" error={errors.gender}>
        <div id="signup-gender">
          <GenderDropdown
            value={values.gender}
            onChange={value => onChange("gender", value)}
          />
        </div>
      </FormField>
    </div>
  )
}
