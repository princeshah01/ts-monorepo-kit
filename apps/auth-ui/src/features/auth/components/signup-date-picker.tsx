import { Calendar } from "@repo/ui/components/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@repo/ui/components/dropdown-menu"
import { CalendarDaysIcon } from "lucide-react"
import { useMemo, useState } from "react"

interface SignupDatePickerProps {
  value: string
  onChange: (value: string) => void
  hasError?: boolean
  describedBy?: string
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatLabel(value: string) {
  if (!value) {
    return "Select your date of birth"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date)
}

export function SignupDatePicker({
  value,
  onChange,
  hasError = false,
  describedBy
}: SignupDatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(value) : undefined
  const maxDate = useMemo(() => new Date(), [])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          id="signup-dob"
          type="button"
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm text-slate-700 transition-[color,box-shadow] hover:border-slate-300 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className={value ? "text-slate-700" : "text-slate-400"}>
            {formatLabel(value)}
          </span>
          <CalendarDaysIcon className="size-4 text-slate-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
      >
        <Calendar
          mode="single"
          selected={selected}
          captionLayout="dropdown"
          className="rounded-2xl"
          onSelect={date => {
            if (!date) {
              return
            }
            onChange(formatDate(date))
            setOpen(false)
          }}
          disabled={{ after: maxDate }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
