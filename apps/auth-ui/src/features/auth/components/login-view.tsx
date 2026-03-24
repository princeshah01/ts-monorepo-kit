import { Button } from "@repo/ui/components/button"
import { useNavigate } from "react-router-dom"

import { ActionRow } from "./action-row"
import { AuthShell } from "./auth-shell"
import { ForgotPasswordSuccessView } from "./forgot-password-success-view"
import { LoginStepEmail } from "./login-step-email"
import { LoginStepPassword } from "./login-step-password"
import { OtpVerificationStep } from "./otp-verification-step"
import { PasswordSetupStep } from "./password-setup-step"
import { useLoginFlow } from "../hooks/use-login-flow"

export function LoginView() {
  const navigate = useNavigate()
  const flow = useLoginFlow()

  if (flow.step === "forgot-password-success") {
    return (
      <ForgotPasswordSuccessView
        topError={flow.topError}
        isLoading={flow.isLoading}
        onContinue={() => {
          flow.setStep("password")
          flow.setPasswordValue("")
        }}
      />
    )
  }

  return (
    <AuthShell
      title={
        flow.step === "forgot-password-otp"
          ? "Enter Code"
          : flow.step === "forgot-password-new"
            ? "New Password"
            : "Sign in"
      }
      description={
        flow.step === "forgot-password-otp"
          ? `We sent a code to ${flow.email}`
          : flow.step === "forgot-password-new"
            ? "Create a new password for your account."
            : "Sign in with your account to continue securely."
      }
      topError={flow.topError}
      isLoading={flow.isLoading}
    >
      <div className="flex min-h-full flex-col justify-between gap-10">
        <div className="grid gap-6 pt-8 md:pt-14">
          {flow.step === "email" ? (
            <LoginStepEmail
              email={flow.email}
              onChange={flow.setEmailValue}
              error={flow.errors.email}
            />
          ) : flow.step === "password" ? (
            <LoginStepPassword
              password={flow.password}
              onChange={flow.setPasswordValue}
              error={flow.errors.password}
              onForgotPassword={flow.requestPasswordResetOtp}
            />
          ) : flow.step === "forgot-password-otp" ? (
            <OtpVerificationStep
              email={flow.email}
              otp={flow.otp}
              otpError={flow.errors.otp}
              onOtpChange={flow.setOtpValue}
              onResend={flow.requestPasswordResetOtp}
            />
          ) : flow.step === "forgot-password-new" ? (
            <PasswordSetupStep
              passwordValue={flow.newPassword}
              onPasswordChange={flow.setNewPasswordValue}
              passwordError={flow.errors.newPassword}
              confirmPasswordValue={flow.confirmNewPassword}
              onConfirmPasswordChange={flow.setConfirmNewPasswordValue}
              confirmPasswordError={flow.errors.confirmNewPassword}
            />
          ) : null}
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
            ) : flow.step === "forgot-password-otp" ||
              flow.step === "forgot-password-new" ? (
              <Button
                variant="ghost"
                className="h-11 rounded-full px-6 text-slate-700 hover:bg-slate-100"
                onClick={() => flow.setStep("password")}
              >
                Cancel
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
                } else if (flow.step === "password") {
                  const result = await flow.login()
                  if (result.unauthorized) {
                    navigate("/unauthorized")
                  }
                } else if (flow.step === "forgot-password-otp") {
                  await flow.verifyOtpAndContinue()
                } else if (flow.step === "forgot-password-new") {
                  await flow.resetPassword()
                }
              }}
            >
              {flow.step === "email"
                ? "Continue"
                : flow.step === "forgot-password-otp"
                  ? "Verify"
                  : flow.step === "forgot-password-new"
                    ? "Reset Password"
                    : "Login"}
            </Button>
          }
        />
      </div>
    </AuthShell>
  )
}
