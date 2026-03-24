import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@repo/ui/components/input-otp"

interface OtpFieldProps {
  id?: string
  value?: string
  onChange?: (value: string) => void
}

export function OtpField({ id, value = "", onChange }: OtpFieldProps) {
  return (
    <InputOTP
      id={id}
      value={value}
      onChange={onChange ?? (() => undefined)}
      maxLength={6}
      containerClassName="w-full"
      className="w-full"
    >
      <InputOTPGroup className="w-full justify-between">
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
