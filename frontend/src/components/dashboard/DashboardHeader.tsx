import { LocationSelect } from '../locations/LocationSelect'

export function DashboardHeader() {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-bold tracking-tight">WeakCollector</h1>
      <LocationSelect />
    </header>
  )
}
