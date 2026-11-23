import { useQuery } from 'urql'
import { useLocationSelection } from '../../contexts/locationSelection'
import {
  LatestReadingsDocument,
  type LatestReadingsQuery,
  type LatestReadingsQueryVariables,
} from '../../types/graphql'
import { ReadingCard } from './ReadingCard'

export function LatestReadings() {
  const { selectedLocationId } = useLocationSelection()
  const [result] = useQuery<LatestReadingsQuery, LatestReadingsQueryVariables>({
    query: LatestReadingsDocument,
    variables: { locationId: selectedLocationId ?? 0 },
    pause: selectedLocationId === null,
  })

  const readings = result.data?.latestMeterReadings ?? []
  const lastPolledAt =
    readings.length > 0
      ? new Date(Math.max(...readings.map((reading) => new Date(reading.polledAt).getTime())))
      : null

  return (
    <section aria-labelledby="latest-readings-title">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="latest-readings-title" className="text-xl font-semibold">
          Latest values
        </h2>
        {lastPolledAt && (
          <time
            dateTime={lastPolledAt.toISOString()}
            className="text-sm text-slate-500 dark:text-slate-400"
          >
            Last polled at {lastPolledAt.toLocaleString()}
          </time>
        )}
      </header>
      {selectedLocationId === null && <p className="text-sm text-slate-500">Select a location.</p>}
      {selectedLocationId !== null && result.fetching && !result.data && (
        <p className="text-sm text-slate-500">Loading latest values…</p>
      )}
      {result.error && <p role="alert">Could not load latest values.</p>}
      {selectedLocationId !== null &&
        !result.fetching &&
        !result.error &&
        readings.length === 0 && (
          <p className="text-sm text-slate-500">No readings have been collected yet.</p>
        )}
      {readings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readings.map((reading) => (
            <ReadingCard key={reading.id} reading={reading} />
          ))}
        </div>
      )}
    </section>
  )
}
