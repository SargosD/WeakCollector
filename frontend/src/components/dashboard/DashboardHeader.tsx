import { type ConnectionStatus, usePollUpdates } from '@/live/pollUpdates'

const StatusLabels: Record<ConnectionStatus, string> = {
  connecting: 'Connecting…',
  live: 'Live',
  reconnecting: 'Reconnecting…',
  offline: 'Offline',
}

const StatusColors: Record<ConnectionStatus, string> = {
  connecting: 'bg-muted-foreground',
  live: 'bg-emerald-500',
  reconnecting: 'bg-amber-500',
  offline: 'bg-destructive',
}

const TimeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })

export function DashboardHeader() {
  const { status, lastPoll } = usePollUpdates()
  const lastPolledAt = lastPoll?.polledAt

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">WeakCollector</h1>
      <div role="status" className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`size-2 rounded-full ${StatusColors[status]}`} />
          {StatusLabels[status]}
        </span>
        {lastPolledAt && <span>Last poll {TimeFormat.format(new Date(lastPolledAt))}</span>}
      </div>
    </header>
  )
}
