import { Link } from "react-router-dom"

import { Button } from "@repo/ui/components/button"

export function NotFoundPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-[linear-gradient(180deg,color-mix(in_srgb,var(--background),#f5f8ff_48%),var(--background))] px-4 py-6">
      <section className="grid w-full max-w-[26rem] justify-items-center gap-4 text-center">
        <p className="text-6xl font-bold tracking-tight">404</p>
        <h1 className="text-3xl font-medium tracking-tight">Page not found</h1>
        <p className="text-muted-foreground">
          The page you requested does not exist.
        </p>
        <Button asChild>
          <Link to="/login">Go to login</Link>
        </Button>
      </section>
    </main>
  )
}
