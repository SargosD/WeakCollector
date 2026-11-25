import { useEffect, useState } from 'react'
import { useQuery } from 'urql'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { QueryState } from '@/components/shared/QueryState'
import { useCursorPagination } from '@/components/shared/hooks/useCursorPagination'
import { useRefetchOnPoll } from '@/realtime/hooks/useRefetchOnPoll'
import { ReadingsDocument, SortEnumType } from '@/types/graphql'
import { formatReading } from '@/components/readings/utils/formatReading'
import { DateTimeFormat } from '@/utils/dateFormats'

const PageSize = 20

export function ReadingsTable() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const { start, variables, next, prev, reset } = useCursorPagination(PageSize)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      reset()
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, reset])

  const [result, reexecute] = useQuery({
    query: ReadingsDocument,
    variables: {
      where: debouncedSearch ? { location: { contains: debouncedSearch } } : undefined,
      order: [
        { polledAt: SortEnumType.Desc },
        { location: SortEnumType.Asc },
        { type: SortEnumType.Asc },
        { id: SortEnumType.Desc },
      ],
      ...variables,
    },
  })

  useRefetchOnPoll(reexecute, start === 0)

  const readings = result.data?.allReadings?.nodes ?? []
  const pageInfo = result.data?.allReadings?.pageInfo

  return (
    <section aria-labelledby="readings-heading" className="mt-10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="readings-heading" className="text-lg font-semibold">
          Readings
        </h2>
        <Input
          type="search"
          aria-label="Search location"
          placeholder="Search location…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:w-64"
        />
      </div>

      <QueryState
        result={result}
        isEmpty={readings.length === 0}
        messages={{
          error: 'Could not load readings.',
          loading: 'Loading readings',
          empty: 'No readings found.',
        }}
      >
        <DataTable
          rows={readings}
          rowKey={(reading) => reading.id}
          columns={[
            {
              header: 'Time',
              headClassName: 'w-[18%]',
              cellClassName: 'whitespace-nowrap tabular-nums',
              cell: (reading) => DateTimeFormat.format(new Date(reading.polledAt)),
            },
            {
              header: 'Location',
              headClassName: 'w-[18%]',
              cellClassName: 'truncate',
              cell: (reading) => reading.location,
            },
            {
              header: 'Type',
              headClassName: 'w-[16%]',
              cellClassName: 'truncate',
              cell: (reading) => formatReading(reading).title,
            },
            {
              header: 'Values',
              cellClassName: 'whitespace-normal',
              cell: (reading) =>
                formatReading(reading)
                  .rows.map((row) => `${row.label} ${row.value}`)
                  .join(' · '),
            },
          ]}
        />

        <Pagination
          start={start}
          count={readings.length}
          total={result.data?.allReadings?.totalCount ?? 0}
          onPrev={() => prev(pageInfo)}
          onNext={() => next(pageInfo)}
        />
      </QueryState>
    </section>
  )
}
