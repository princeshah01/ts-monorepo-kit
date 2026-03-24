import { useNavigate } from "react-router-dom"

import { Button } from "@repo/ui/components/button"

import { useSignupFlow } from "../hooks/use-signup-flow"
import { ActionRow } from "./action-row"
import { AuthShell } from "./auth-shell"
import { SignupStepFour } from "./signup-step-four"
import { SignupStepOne } from "./signup-step-one"
import { SignupStepThree } from "./signup-step-three"
import { SignupStepTwo } from "./signup-step-two"

export function SignupView() {
  const navigate = useNavigate()
  const flow = useSignupFlow()

  return (
    <AuthShell
      title={flow.left[0]!}
      description={flow.left[1]!}
      topError={flow.topError}
      isLoading={flow.isLoading}
    >
      <div className="flex min-h-full flex-col justify-between gap-10">
        <div className="grid gap-6 pt-8 md:pt-14">
          {flow.step === 1 ? (
            <SignupStepOne
              values={flow.values}
              errors={flow.errors}
              onChange={flow.update}
            />
          ) : flow.step === 2 ? (
            <SignupStepTwo
              values={flow.values}
              errors={flow.errors}
              onChange={flow.update}
            />
          ) : flow.step === 3 ? (
            <SignupStepThree
              email={flow.values.email}
              otp={flow.values.otp}
              otpError={flow.errors.otp}
              onOtpChange={value => flow.update("otp", value)}
              onResend={() => undefined}
            />
          ) : (
            <SignupStepFour
              values={flow.values}
              errors={flow.errors}
              onChange={flow.update}
            />
          )}
        </div>
        <ActionRow
          left={
            <Button
              variant="ghost"
              className="h-11 rounded-full px-6 text-slate-700 hover:bg-slate-100"
              onClick={() =>
                flow.step === 1
                  ? navigate("/login")
                  : flow.setStep(prev => (prev - 1) as 1 | 2 | 3 | 4)
              }
            >
              {flow.step === 1 ? "Back to login" : "Back"}
            </Button>
          }
          right={
            <Button
              className="h-11 rounded-full px-8"
              onClick={async () => {
                const done = await flow.nextStep()
                if (done) {
                  navigate("/login")
                }
              }}
            >
              {flow.step === 4 ? "Create account" : "Next"}
            </Button>
          }
        />
      </div>
    </AuthShell>
  )
}
