import type { ReactNode } from "react"

import { Input } from "@repo/ui/components/input"

interface FieldChildProps {
  id: string
  value: string
  onChange: (value: string) => void
}

interface FormFieldProps {
  label: string
  htmlFor?: string
  value?: string
  onChange?: (value: string) => void
  type?: React.ComponentProps<typeof Input>["type"]
  placeholder?: string
  error?: string
  children?: ReactNode | ((props: FieldChildProps) => ReactNode)
}

export function FormField({
  label,
  htmlFor,
  value,
  onChange,
  type,
  placeholder,
  error,
  children
}: FormFieldProps) {
  const fieldId = htmlFor ?? label.toLowerCase().replace(/\s+/g, "-")
  const renderProps: FieldChildProps = {
    id: fieldId,
    value: value ?? "",
    onChange: onChange ?? (() => undefined)
  }

  return (
    <div className="grid gap-1">
      <label htmlFor={fieldId} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      {typeof children === "function" ? children(renderProps) : children}
      {!children ? (
        <Input
          id={renderProps.id}
          type={type}
          value={renderProps.value}
          onChange={event => renderProps.onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11"
        />
      ) : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}
