import { useQuery } from 'urql'
import { LocationsDocument } from '../../types/graphql/graphql'

export function LocationsList() {
  const [result, reexecuteQuery] = useQuery({ query: LocationsDocument })

  if (result.fetching && !result.data) {
    return <p className="text-slate-600 dark:text-slate-400">Loading locations…</p>
  }

  if (result.error) {
    return (
      <div
        className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        role="alert"
      >
        <p>Could not load locations: {result.error.message}</p>
        <button
          type="button"
          className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
          onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })}
        >
          Try again
        </button>
      </div>
    )
  }

  const locations = result.data?.locations ?? []

  if (locations.length === 0) {
    return (
      <p className="text-slate-600 dark:text-slate-400">No locations have been collected yet.</p>
    )
  }

  return (
    <section aria-labelledby="locations-heading">
      <h2 id="locations-heading" className="text-xl font-semibold">
        Locations
      </h2>
      <ul className="mt-4 grid gap-3">
        {locations.map((location) => (
          <li
            key={location.id}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {location.name}
          </li>
        ))}
      </ul>
    </section>
  )
}
