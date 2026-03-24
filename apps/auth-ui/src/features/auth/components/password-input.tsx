import { useId, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@repo/ui/components/input"

interface PasswordInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  ariaLabel
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
        className="h-11 pr-11"
      />
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={show}
        onClick={() => setShow(prev => !prev)}
        className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-slate-500 hover:bg-slate-100"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
