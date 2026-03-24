import { LoginView } from "./login-view"
import { SignupView } from "./signup-view"
import { UnauthorizedView } from "./unauthorized-view"

type Screen = "login" | "signup" | "unauthorized"

interface AuthFlowCardProps {
  initialScreen?: Screen
}

export function AuthFlowCard({ initialScreen = "login" }: AuthFlowCardProps) {
  if (initialScreen === "signup") {
    return <SignupView />
  }

  if (initialScreen === "unauthorized") {
    return <UnauthorizedView />
  }

  return <LoginView />
}
