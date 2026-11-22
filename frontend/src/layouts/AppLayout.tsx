import type { ReactNode } from 'react'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">WeakCollector</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Meter locations collected from the WeakApp API.
          </p>
        </header>
        {children}
      </div>
    </main>
  )
}
