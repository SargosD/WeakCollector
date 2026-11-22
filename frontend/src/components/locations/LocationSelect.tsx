import { useEffect } from 'react'
import { useQuery } from 'urql'
import { useLocationSelection } from '../../contexts/locationSelection'
import {
  LocationsDocument,
  type LocationsQuery,
  type LocationsQueryVariables,
} from '../../types/graphql'

export function LocationSelect() {
  const { selectedLocationId, selectLocation } = useLocationSelection()
  const [result] = useQuery<LocationsQuery, LocationsQueryVariables>({
    query: LocationsDocument,
  })

  const locations = result.data?.locations ?? []
  const firstLocationId = locations[0]?.id
  const loading = result.fetching && !result.data
  const unavailable = loading || Boolean(result.error) || locations.length === 0

  useEffect(() => {
    if (selectedLocationId === null && firstLocationId !== undefined) {
      selectLocation(firstLocationId)
    }
  }, [selectedLocationId, firstLocationId, selectLocation])

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="location-select"
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        Location
      </label>
      <select
        id="location-select"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        value={unavailable ? '' : (selectedLocationId ?? '')}
        onChange={(event) => selectLocation(Number(event.target.value))}
        disabled={unavailable}
      >
        {loading && <option value="">Loading locations…</option>}
        {result.error && <option value="">Could not load locations</option>}
        {!loading && !result.error && locations.length === 0 && (
          <option value="">No locations have been collected yet.</option>
        )}
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  )
}
