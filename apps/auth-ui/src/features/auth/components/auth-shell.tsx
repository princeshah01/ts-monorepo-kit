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
    <main className="grid min-h-svh place-items-center bg-[#f6f8fb] px-4 py-8 sm:px-6">
      <section className="w-full max-w-5xl rounded-4xl border border-slate-300 bg-white px-5 pt-6 pb-3 shadow-[0_26px_80px_rgba(15,23,42,0.08)] sm:px-7 sm:pt-7 sm:pb-4 lg:px-8 lg:pt-8 lg:pb-4 lg:min-h-120">
        <div className="grid h-full gap-8 md:grid-cols-[0.96fr_1.04fr] md:gap-10">
          {/* LEFT SIDE */}
          <aside className="flex flex-col justify-start py-2 md:py-3">
            <div className="grid size-14 place-items-center rounded-xl border border-slate-200 bg-[repeating-linear-gradient(315deg,rgba(0,0,0,0.15)_0,rgba(0,0,0,0.15)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] lg:bg-size-[7px_7px]">
              {/* Here we can add an apps icon */}
            </div>
            <h1 className="mt-8 text-4xl font-medium tracking-tight text-slate-900 sm:text-[3.2rem]">
              {title}
            </h1>

            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600">
              {description}
            </p>
          </aside>

          {/* RIGHT SIDE */}
          <section className="relative flex min-h-88 flex-col justify-between py-2 md:min-h-104 md:py-3">
            <TopLoader isVisible={isLoading} />

            {topError ? (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {topError}
              </div>
            ) : null}

            {children}
          </section>
        </div>
      </section>
    </main>
  )
}
