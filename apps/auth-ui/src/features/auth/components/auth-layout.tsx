import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@repo/ui/components/card"

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({
  title,
  description,
  children,
  footer
}: AuthLayoutProps) {
  return (
    <main className="min-h-svh bg-[radial-gradient(90rem_40rem_at_-20%_-10%,color-mix(in_srgb,var(--ring),white_88%),transparent),radial-gradient(65rem_30rem_at_120%_110%,color-mix(in_srgb,var(--primary),white_92%),transparent),linear-gradient(180deg,color-mix(in_srgb,var(--background),white_30%),var(--background))] px-4 py-6 sm:px-6">
      <section
        className="mx-auto grid w-full max-w-[29rem] gap-4"
        aria-label="Authentication"
      >
        <div className="flex justify-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/90"
            aria-label="Go to login"
          >
            <span className="size-3 rounded-full bg-[linear-gradient(140deg,#0f62fe,#1e90ff)] shadow-[0_0_0_0.45rem_color-mix(in_srgb,#0f62fe,transparent_82%)]" />
            <span>Secure SSO</span>
          </Link>
        </div>

        <Card className="gap-5 border-border/90 bg-card/90 py-6 shadow-[0_16px_48px_rgba(16,24,40,0.14)] backdrop-blur">
          <CardHeader className="gap-2 pb-0">
            <CardTitle className="text-2xl font-medium tracking-tight sm:text-[1.75rem]">
              {title}
            </CardTitle>
            <CardDescription className="text-[0.96rem] leading-relaxed">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">{children}</CardContent>

          {footer ? (
            <div className="border-t border-border px-6 pt-4">{footer}</div>
          ) : null}
        </Card>
      </section>
    </main>
  )
}
