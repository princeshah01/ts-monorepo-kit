import type { ReactNode } from "react"

import { TopLoader } from "./top-loader"

interface AuthShellProps {
  title: string
  description: string
  topError?: string
  isLoading?: boolean
  children: ReactNode
}

export function AuthShell({
  title,
  description,
  topError,
  isLoading = false,
  children
}: AuthShellProps) {
  return (
    <main className="grid min-h-svh place-items-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] min-h-[90svh] md:h-[50svh] md:min-h-0 md:p-6 lg:p-7">
        <div className="grid h-full gap-6 md:grid-cols-[0.9fr_1.1fr] md:gap-8">
          <aside className="h-full rounded-2xl bg-slate-100 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              Secure Authentication
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
              {description}
            </p>
          </aside>

          <section className="relative flex h-full flex-col rounded-2xl border border-slate-200 p-5 sm:p-6">
            <TopLoader isVisible={isLoading} />
            {topError ? (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {topError}
              </div>
            ) : null}
            <div className="flex h-full flex-col">{children}</div>
          </section>
        </div>
      </section>
    </main>
  )
}
