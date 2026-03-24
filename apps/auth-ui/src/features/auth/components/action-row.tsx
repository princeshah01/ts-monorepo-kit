import type { ReactNode } from "react"

interface ActionRowProps {
  left: ReactNode
  right: ReactNode
}

export function ActionRow({ left, right }: ActionRowProps) {
  return (
    <div className="pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>{left}</div>
        <div>{right}</div>
      </div>
    </div>
  )
}
