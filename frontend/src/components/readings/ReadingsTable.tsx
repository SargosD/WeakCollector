import { AlertCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQuery } from 'urql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ReadingsDocument, SortEnumType } from '@/types/graphql'
import { formatReading } from './utils/formatReading'

const PageSize = 20

const TimeFormat = new Intl.DateTimeFormat(undefined, {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

type Page = { after?: string; before?: string; start: number }

export function ReadingsTable() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState<Page>({ start: 0 })

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage({ start: 0 })
    }, 300)

    return () => clearTimeout(timeout)
  }, [search])

  const [{ data, error, fetching }] = useQuery({
    query: ReadingsDocument,
    variables: {
      where: debouncedSearch ? { location: { contains: debouncedSearch } } : undefined,
      order: [
        { polledAt: SortEnumType.Desc },
        { location: SortEnumType.Asc },
        { type: SortEnumType.Asc },
        { id: SortEnumType.Desc },
      ],
      ...(page.before
        ? { last: PageSize, before: page.before }
        : { first: PageSize, after: page.after }),
    },
  })

  const readings = data?.allReadings?.nodes ?? []
  const total = data?.allReadings?.totalCount ?? 0
  const pageInfo = data?.allReadings?.pageInfo

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

      {error && (
        <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircleIcon aria-hidden="true" className="size-5" />
          <span>Could not load readings.</span>
        </div>
      )}

      {!error && !data && fetching && (
        <Spinner aria-label="Loading readings" className="size-5 text-muted-foreground" />
      )}

      {!error && data && readings.length === 0 && (
        <p className="text-sm text-muted-foreground">No readings found.</p>
      )}

      {!error && readings.length > 0 && (
        <>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[18%]">Time</TableHead>
                <TableHead className="w-[18%]">Location</TableHead>
                <TableHead className="w-[16%]">Type</TableHead>
                <TableHead>Values</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((reading) => {
                const { title, rows } = formatReading(reading)

                return (
                  <TableRow key={reading.id}>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {TimeFormat.format(new Date(reading.polledAt))}
                    </TableCell>
                    <TableCell className="truncate">{reading.location}</TableCell>
                    <TableCell className="truncate">{title}</TableCell>
                    <TableCell className="whitespace-normal">
                      {rows.map((row) => `${row.label} ${row.value}`).join(' · ')}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {page.start + 1}–{page.start + readings.length} of {total}
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page.start === 0}
                onClick={() =>
                  setPage({
                    before: pageInfo?.startCursor ?? undefined,
                    start: Math.max(0, page.start - PageSize),
                  })
                }
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page.start + readings.length >= total}
                onClick={() =>
                  setPage({ after: pageInfo?.endCursor ?? undefined, start: page.start + PageSize })
                }
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
