import type { ReactNode } from 'react'
import { Header } from './Header'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  )
}
