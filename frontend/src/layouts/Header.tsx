import { useContext } from 'react'
import { LastPollContext } from '@/realtime/context/lastPollContext'
import { DateTimeFormat } from '@/utils/dateFormats'

export function Header() {
  const polledAt = useContext(LastPollContext)?.polledAt

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">WeakCollector</h1>
      {polledAt && (
        <span role="status" className="text-sm text-muted-foreground">
          Last poll {DateTimeFormat.format(new Date(polledAt))}
        </span>
      )}
    </header>
  )
}
