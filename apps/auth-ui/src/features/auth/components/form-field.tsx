import { Input } from "@repo/ui/components/input"
import type { ReactNode } from "react"

interface FieldChildProps {
  id: string
  describedBy?: string
  hasError: boolean
}

interface InputWrapperProps {
  label: string
  htmlFor?: string
  value?: string
  onChange?: (value: string) => void
  type?: React.ComponentProps<typeof Input>["type"]
  placeholder?: string
  error?: string
  children?: ReactNode | ((props: FieldChildProps) => ReactNode)
}

export function InputWrapper({
  label,
  htmlFor,
  value,
  onChange,
  type,
  placeholder,
  error,
  children
}: InputWrapperProps) {
  const fieldId = htmlFor ?? label.toLowerCase().replace(/\s+/g, "-")
  const errorId = error ? `${fieldId}-error` : undefined
  const renderProps: FieldChildProps = {
    id: fieldId,
    describedBy: errorId,
    hasError: Boolean(error)
  }

  return (
    <div className="grid gap-2">
      <label
        htmlFor={fieldId}
        className="text-sm font-medium tracking-tight text-slate-700"
      >
        {label}
      </label>
      {typeof children === "function" ? children(renderProps) : children}
      {!children ? (
        <Input
          id={fieldId}
          type={type}
          value={value ?? ""}
          onChange={event => (onChange ?? (() => undefined))(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className="h-12 rounded-xl border-slate-200 bg-white px-4 shadow-none placeholder:text-slate-400"
        />
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
