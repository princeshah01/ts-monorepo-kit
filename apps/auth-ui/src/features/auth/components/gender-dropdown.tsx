import { ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@repo/ui/components/dropdown-menu"

interface GenderDropdownProps {
  value: string
  onChange: (value: string) => void
}

export function GenderDropdown({ value, onChange }: GenderDropdownProps) {
  const label = value
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : "Select gender"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm text-slate-700 outline-none transition-[color,box-shadow] hover:border-slate-300 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span>{label}</span>
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
