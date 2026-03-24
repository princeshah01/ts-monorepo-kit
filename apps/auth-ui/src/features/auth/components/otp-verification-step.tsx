import { InputWrapper } from "./form-field"
import { OtpSection } from "./otp-section"

interface OtpVerificationStepProps {
  email: string
  otp: string
  otpError?: string
  onOtpChange: (value: string) => void
  onResend: () => void
}

export function OtpVerificationStep({
  email,
  otp,
  otpError,
  onOtpChange,
  onResend
}: OtpVerificationStepProps) {
  return (
    <InputWrapper
      label="Verification code"
      htmlFor="verification-otp"
      error={otpError}
    >
      {field => (
        <OtpSection
          email={email}
          otp={otp}
          onOtpChange={onOtpChange}
          onResend={onResend}
          describedBy={field.describedBy}
          hasError={field.hasError}
        />
      )}
    </InputWrapper>
  )
}
