import { useEffect } from "react"

import { Button } from "@repo/ui/components/button"

import { useResendTimer } from "../hooks/use-resend-timer"
import { OtpField } from "./otp-field"

interface OtpSectionProps {
  email: string
  otp: string
  onOtpChange: (value: string) => void
  onResend: () => void
}

export function OtpSection({
  email,
  otp,
  onOtpChange,
  onResend
}: OtpSectionProps) {
  const { seconds, canResend, start } = useResendTimer(30)

  useEffect(() => {
    start()
  }, [start])

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-600">{email}</p>
      <p className="text-sm text-slate-700">OTP sent to your email</p>
      <OtpField id="signup-otp" value={otp} onChange={onOtpChange} />
      <Button
        variant="secondary"
        size="sm"
        className="justify-self-start"
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
