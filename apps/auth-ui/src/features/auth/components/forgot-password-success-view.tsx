import { Button } from "@repo/ui/components/button"
import { CheckCircle2 } from "lucide-react"

import { AuthShell } from "./auth-shell"

interface ForgotPasswordSuccessViewProps {
  topError?: string
  isLoading?: boolean
  onContinue: () => void
}

export function ForgotPasswordSuccessView({
  topError,
  isLoading,
  onContinue
}: ForgotPasswordSuccessViewProps) {
  return (
    <AuthShell
      title="Password updated"
      description="Your password has been changed successfully."
      topError={topError}
      isLoading={isLoading}
    >
      <div className="flex h-full flex-col items-center justify-center space-y-6 pt-12 pb-8">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-500">Want to log in to the app?</p>
        </div>
        <Button
          className="h-11 w-full max-w-xs rounded-full"
          onClick={onContinue}
        >
          Continue to Login
        </Button>
      </div>
    </AuthShell>
  )
}
