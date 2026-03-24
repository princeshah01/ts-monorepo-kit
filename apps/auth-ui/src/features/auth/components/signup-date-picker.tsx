import { useMemo, useState } from "react"

import { Calendar } from "@repo/ui/components/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@repo/ui/components/dropdown-menu"

interface SignupDatePickerProps {
  value: string
  onChange: (value: string) => void
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function SignupDatePicker({ value, onChange }: SignupDatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(value) : undefined
  const maxDate = useMemo(() => new Date(), [])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center rounded-md border border-input bg-background px-3 text-left text-sm text-slate-700 hover:border-slate-300 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {value || "Select date of birth"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-auto border border-input p-0"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={date => {
            if (!date) return
            onChange(formatDate(date))
            setOpen(false)
          }}
          disabled={{ after: maxDate }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
