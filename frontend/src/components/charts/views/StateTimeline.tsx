import { useMemo } from 'react'
import { useQuery } from 'urql'
import { QueryState } from '@/components/shared/QueryState'
import { useRefetchOnPoll } from '@/realtime/hooks/useRefetchOnPoll'
import { AggregateFunction, MeasurementTrendDocument, type TimeRange } from '@/types/graphql'
import type { Metric } from '@/components/charts/utils/formatMetrics'
import { DateTimeFormat } from '@/utils/dateFormats'
import { TickFormats } from '@/components/charts/utils/timeFormats'

type StateTimelineProps = {
  metric: Metric
  range: TimeRange
}

export function StateTimeline({ metric, range }: StateTimelineProps) {
  const [result, reexecute] = useQuery({
    query: MeasurementTrendDocument,
    variables: { type: metric.type, name: metric.name, range, aggregate: AggregateFunction.Max },
  })
  useRefetchOnPoll(reexecute)

  const { slots, rows } = useMemo(() => {
    const points = result.data?.measurementTrend ?? []
    const byLocation = new Map<string, Map<string, boolean>>()

    for (const point of points) {
      const states = byLocation.get(point.location) ?? new Map<string, boolean>()
      states.set(point.polledAt, point.value > 0)
      byLocation.set(point.location, states)
    }

    return {
      slots: [...new Set(points.map((point) => point.polledAt))].sort(),
      rows: [...byLocation].sort(([a], [b]) => a.localeCompare(b)),
    }
  }, [result.data])

  const tickFormat = new Intl.DateTimeFormat(undefined, TickFormats[range])
  const firstSlot = slots.at(0)
  const lastSlot = slots.at(-1)

  return (
    <QueryState
      result={result}
      isEmpty={rows.length === 0}
      messages={{
        error: 'Could not load the timeline.',
        loading: 'Loading timeline',
        empty: 'No data in this period.',
      }}
      className="h-72"
    >
      <figure aria-label={`${metric.label} timeline`} className="w-full space-y-2">
        <div className="flex h-72 flex-col gap-1">
          {rows.map(([location, states]) => (
            <div key={location} className="flex min-h-0 flex-1 items-center gap-3">
              <span className="w-24 shrink-0 truncate text-xs text-muted-foreground">
                {location}
              </span>
              <div className="flex h-full max-h-10 flex-1 gap-px">
                {slots.map((slot) => {
                  const state = states.get(slot)
                  const label = state === undefined ? 'No data' : state ? 'True' : 'False'

                  return (
                    <div
                      key={slot}
                      title={`${location} · ${DateTimeFormat.format(new Date(slot))} · ${label}`}
                      className={`flex-1 rounded-[1px] ${state ? 'bg-sky-500' : state === false ? 'bg-muted' : ''}`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pl-27 text-xs text-muted-foreground">
          <span>{firstSlot && tickFormat.format(new Date(firstSlot))}</span>
          <span>{lastSlot && tickFormat.format(new Date(lastSlot))}</span>
        </div>

        <div className="flex gap-4 pl-27 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-[1px] bg-sky-500" />
            True
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-[1px] bg-muted" />
            False
          </span>
        </div>
      </figure>
    </QueryState>
  )
}
