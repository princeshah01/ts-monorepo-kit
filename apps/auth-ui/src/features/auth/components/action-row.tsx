import type { ReactNode } from "react"

interface ActionRowProps {
  left: ReactNode
  right: ReactNode
}

export function ActionRow({ left, right }: ActionRowProps) {
  return (
    <div className="pt-6">
      <div className="flex gap-3 items-center justify-between">
        <div>{left}</div>
        <div>{right}</div>
      </div>
    </div>
  )
}
