import { useNavigate } from "react-router-dom"

import { Button } from "@repo/ui/components/button"
import { useLoginFlow } from "../hooks/use-login-flow"
import { ActionRow } from "./action-row"
import { AuthShell } from "./auth-shell"
import { FormField } from "./form-field"
import { PasswordInput } from "./password-input"

export function LoginView() {
  const navigate = useNavigate()
  const flow = useLoginFlow()

  return (
    <AuthShell
      title="Sign in"
      description="Sign in with your account to continue securely."
      topError={flow.topError}
      isLoading={flow.isLoading}
    >
      <div className="grid h-full gap-4">
        {flow.step === "email" ? (
          <FormField
            label="Email"
            htmlFor="login-email"
            type="email"
            value={flow.email}
            onChange={flow.setEmailValue}
            error={flow.errors.email}
          />
        ) : (
          <FormField
            label="Password"
            htmlFor="login-password"
            error={flow.errors.password}
          >
            {field => (
              <PasswordInput
                id={field.id}
                value={flow.password}
                onChange={flow.setPasswordValue}
                placeholder="Enter password"
                ariaLabel="Toggle password visibility"
              />
            )}
          </FormField>
        )}

        <ActionRow
          left={
            flow.step === "email" ? (
              <button
                type="button"
                className="text-sm font-medium text-sky-700 hover:underline"
                onClick={() => navigate("/register")}
              >
                Create account
              </button>
            ) : (
              <Button
                variant="ghost"
                className="h-11 rounded-full px-6"
                onClick={() => flow.setStep("email")}
              >
                Back
              </Button>
            )
          }
          right={
            <Button
              className="h-11 rounded-full px-6"
              onClick={async () => {
                if (flow.step === "email") {
                  await flow.continueWithEmail()
                  return
                }
                const result = await flow.login()
                if (result.unauthorized) {
                  navigate("/unauthorized")
                }
              }}
            >
              {flow.step === "email" ? "Continue" : "Login"}
            </Button>
          }
        />
      </div>
    </AuthShell>
  )
}
