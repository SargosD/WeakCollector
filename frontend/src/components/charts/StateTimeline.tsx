import { AlertCircleIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useQuery } from 'urql'
import { Spinner } from '@/components/ui/spinner'
import { AggregateFunction, MeasurementTrendDocument, type TimeRange } from '@/types/graphql'
import type { Metric } from './utils/metricOptions'
import { TickFormats, TooltipFormat } from './utils/timeFormats'

type StateTimelineProps = {
  metric: Metric
  range: TimeRange
}

export function StateTimeline({ metric, range }: StateTimelineProps) {
  const [{ data, error, fetching }] = useQuery({
    query: MeasurementTrendDocument,
    variables: { type: metric.type, name: metric.name, range, aggregate: AggregateFunction.Max },
  })

  const { slots, rows } = useMemo(() => {
    const points = data?.measurementTrend ?? []
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
  }, [data])

  if (error) {
    return (
      <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircleIcon aria-hidden="true" className="size-5" />
        <span>Could not load the timeline.</span>
      </div>
    )
  }

  if (!data && fetching) {
    return <Spinner aria-label="Loading timeline" className="size-5 text-muted-foreground" />
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No data in this period.</p>
  }

  const tickFormat = new Intl.DateTimeFormat(undefined, TickFormats[range])
  const tooltipFormat = new Intl.DateTimeFormat(undefined, TooltipFormat)

  return (
    <figure aria-label={`${metric.label} timeline`} className="w-full space-y-2">
      {rows.map(([location, states]) => (
        <div key={location} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs text-muted-foreground">{location}</span>
          <div className="flex h-6 flex-1 gap-px">
            {slots.map((slot) => {
              const state = states.get(slot)
              const label = state === undefined ? 'No data' : state ? 'On' : 'Off'

              return (
                <div
                  key={slot}
                  title={`${location} · ${tooltipFormat.format(new Date(slot))} · ${label}`}
                  className={`flex-1 rounded-[1px] ${state ? 'bg-sky-500' : state === false ? 'bg-muted' : ''}`}
                />
              )
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-between pl-27 text-xs text-muted-foreground">
        <span>{tickFormat.format(new Date(slots[0]))}</span>
        <span>{tickFormat.format(new Date(slots[slots.length - 1]))}</span>
      </div>

      <div className="flex gap-4 pl-27 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-[1px] bg-sky-500" />
          On
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-[1px] bg-muted" />
          Off
        </span>
      </div>
    </figure>
  )
}
