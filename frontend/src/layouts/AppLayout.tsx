import type { ReactNode } from 'react'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
    </main>
  )
}
