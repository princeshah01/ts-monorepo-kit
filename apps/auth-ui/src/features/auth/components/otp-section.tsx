import { Button } from "@repo/ui/components/button"
import { useEffect } from "react"

import { OtpField } from "./otp-field"
import { useResendTimer } from "../hooks/use-resend-timer"

interface OtpSectionProps {
  email: string
  otp: string
  onOtpChange: (value: string) => void
  onResend: () => void
  describedBy?: string
  hasError?: boolean
}

export function OtpSection({
  email,
  otp,
  onOtpChange,
  onResend,
  describedBy,
  hasError = false
}: OtpSectionProps) {
  const { seconds, canResend, start } = useResendTimer(30)

  useEffect(() => {
    start()
  }, [start])

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="grid gap-1">
        <p className="text-sm font-medium text-slate-800">OTP sent to your email</p>
        <p className="text-sm text-slate-500">{email}</p>
      </div>
      <OtpField
        id="signup-otp"
        value={otp}
        onChange={onOtpChange}
        describedBy={describedBy}
        hasError={hasError}
      />
      <Button
        variant="secondary"
        size="sm"
        className="h-10 justify-self-start rounded-full px-4"
        disabled={!canResend}
        onClick={() => {
          onResend()
          start()
        }}
      >
        {canResend ? "Resend" : `Resend in ${seconds}s`}
      </Button>
    </div>
  )
}
