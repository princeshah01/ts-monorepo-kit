import { Button } from "@repo/ui/components/button"
import { useNavigate } from "react-router-dom"


import { ActionRow } from "./action-row"
import { AuthShell } from "./auth-shell"

export function UnauthorizedView() {
  const navigate = useNavigate()

  return (
    <AuthShell
      title="Unauthorized access"
      description="You are not authorized. You do not have permission to access this."
    >
      <div className="grid h-full gap-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <h2 className="text-lg font-semibold text-rose-700">Access denied</h2>
          <p className="mt-2 text-sm text-rose-600">
            You do not have permission to access this resource.
          </p>
        </div>

        <ActionRow
          left={<div />}
          right={
            <Button
              className="h-11 rounded-full px-6"
              onClick={() => navigate("/login")}
            >
              Back to login
            </Button>
          }
        />
      </div>
    </AuthShell>
  )
}
