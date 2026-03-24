import type { ReactNode } from "react"

import { cn } from "@repo/ui/lib/utils"

interface StepFrameProps {
  stepKey: string
  children: ReactNode
}

export function StepFrame({ stepKey, children }: StepFrameProps) {
  return (
    <section key={stepKey} className={cn("step-frame", "step-frame--enter")}>
      {children}
    </section>
  )
}
