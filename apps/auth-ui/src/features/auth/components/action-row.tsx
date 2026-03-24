import type { ReactNode } from "react"

interface ActionRowProps {
  left: ReactNode
  right: ReactNode
}

export function ActionRow({ left, right }: ActionRowProps) {
  return (
    <div className="mt-auto">
      <div className="flex items-center justify-between gap-3">
        <div>{left}</div>
        <div>{right}</div>
      </div>
    </div>
  )
}
