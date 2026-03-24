import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@repo/ui/components/input-otp"

interface OtpFieldProps {
  id?: string
  value?: string
  onChange?: (value: string) => void
  describedBy?: string
  hasError?: boolean
}

export function OtpField({
  id,
  value = "",
  onChange,
  describedBy,
  hasError = false
}: OtpFieldProps) {
  return (
    <InputOTP
      id={id}
      value={value}
      onChange={onChange ?? (() => undefined)}
      maxLength={6}
      aria-describedby={describedBy}
      aria-invalid={hasError}
      containerClassName="w-full"
      className="w-full"
    >
      <InputOTPGroup className="grid w-full grid-cols-6 gap-2 sm:gap-3">
        <InputOTPSlot
          index={0}
          className="w-full rounded-sm border first:rounded-sm last:rounded-sm"
        />
        <InputOTPSlot
          index={1}
          className="w-full rounded-sm border first:rounded-sm last:rounded-sm"
        />
        <InputOTPSlot
          index={2}
          className="w-full rounded-sm border first:rounded-sm last:rounded-sm"
        />
        <InputOTPSlot
          index={3}
          className="w-full rounded-sm border first:rounded-sm last:rounded-sm"
        />
        <InputOTPSlot
          index={4}
          className="w-full rounded-sm border first:rounded-sm last:rounded-sm"
        />
        <InputOTPSlot
          index={5}
          className="w-full rounded-sm border first:rounded-sm last:rounded-sm"
        />
      </InputOTPGroup>
    </InputOTP>
  )
}
