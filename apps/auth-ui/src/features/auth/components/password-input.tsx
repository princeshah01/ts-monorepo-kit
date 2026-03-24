import { Input } from "@repo/ui/components/input"
import { Eye, EyeOff } from "lucide-react"
import { useId, useState } from "react"

interface PasswordInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
  ariaDescribedBy?: string
  hasError?: boolean
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  ariaLabel,
  ariaDescribedBy,
  hasError = false
}: PasswordInputProps) {
  const [show, setShow] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="relative flex items-center">
      <Input
        id={inputId}
        type={show ? "text" : "password"}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={ariaDescribedBy}
        className="h-12 rounded-xl border-slate-200 bg-white px-4 pr-11 shadow-none placeholder:text-slate-400"
      />
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={show}
        onClick={() => setShow(prev => !prev)}
        className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
