import { Button } from "@repo/ui/components/button"
import { useNavigate } from "react-router-dom"

import { ActionRow } from "./action-row"
import { AuthShell } from "./auth-shell"
import { InputWrapper } from "./form-field"
import { PasswordInput } from "./password-input"
import { useLoginFlow } from "../hooks/use-login-flow"

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
      <div className="flex min-h-full flex-col justify-between gap-10">
        <div className="grid gap-6 pt-8 md:pt-14">
          {flow.step === "email" ? (
            <InputWrapper
              label="Email"
              htmlFor="login-email"
              type="email"
              value={flow.email}
              onChange={flow.setEmailValue}
              placeholder="Email or phone"
              error={flow.errors.email}
            />
          ) : (
            <InputWrapper
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
                  ariaDescribedBy={field.describedBy}
                  hasError={field.hasError}
                />
              )}
            </InputWrapper>
          )}
        </div>
        <ActionRow
          left={
            flow.step === "email" ? (
              <Button
                variant="ghost"
                className="h-11 rounded-full px-6 text-sky-700 hover:bg-sky-50 hover:text-sky-700"
                onClick={() => navigate("/register")}
              >
                Create account
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="h-11 rounded-full px-6 text-slate-700 hover:bg-slate-100"
                onClick={() => flow.setStep("email")}
              >
                Back
              </Button>
            )
          }
          right={
            <Button
              className="h-11 rounded-full px-8"
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
