import { FormField } from "./form-field"
import { OtpSection } from "./otp-section"

interface SignupStepThreeProps {
  email: string
  otp: string
  otpError?: string
  onOtpChange: (value: string) => void
  onResend: () => void
}

export function SignupStepThree({
  email,
  otp,
  otpError,
  onOtpChange,
  onResend
}: SignupStepThreeProps) {
  return (
    <FormField label="Verification code" htmlFor="signup-otp" error={otpError}>
      <OtpSection
        email={email}
        otp={otp}
        onOtpChange={onOtpChange}
        onResend={onResend}
      />
    </FormField>
  )
}
