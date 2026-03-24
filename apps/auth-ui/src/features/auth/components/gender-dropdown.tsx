import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@repo/ui/components/dropdown-menu"
import { ChevronDownIcon } from "lucide-react"

interface GenderDropdownProps {
  value: string
  onChange: (value: string) => void
  hasError?: boolean
  describedBy?: string
}

export function GenderDropdown({
  value,
  onChange,
  hasError = false,
  describedBy
}: GenderDropdownProps) {
  const label = value
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : "Select gender"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id="signup-gender"
          type="button"
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm text-slate-700 outline-none transition-[color,box-shadow] hover:border-slate-300 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className={value ? "text-slate-700" : "text-slate-400"}>
            {label}
          </span>
          <ChevronDownIcon className="size-4 text-slate-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] border border-input bg-background"
      >
        <DropdownMenuItem onSelect={() => onChange("male")}>
          Male
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onChange("female")}>
          Female
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onChange("other")}>
          Other
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
