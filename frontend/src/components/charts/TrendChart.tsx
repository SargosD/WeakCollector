import { AlertCircleIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { useQuery } from 'urql'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Spinner } from '@/components/ui/spinner'
import { useRefetchOnPoll } from '@/live/pollUpdates'
import { type AggregateFunction, MeasurementTrendDocument, type TimeRange } from '@/types/graphql'
import type { Metric } from './utils/metricOptions'
import { TickFormats, TooltipFormat } from './utils/timeFormats'

type TrendChartProps = {
  metric: Metric
  range: TimeRange
  aggregate: AggregateFunction
}

export function TrendChart({ metric, range, aggregate }: TrendChartProps) {
  const [{ data, error, fetching }, reexecute] = useQuery({
    query: MeasurementTrendDocument,
    variables: { type: metric.type, name: metric.name, range, aggregate },
  })
  useRefetchOnPoll(reexecute)
  const [hidden, setHidden] = useState<string[]>([])

  const lines = useMemo(() => {
    const byLocation = new Map<string, { time: number; value: number }[]>()

    for (const point of data?.measurementTrend ?? []) {
      const line = byLocation.get(point.location) ?? []
      line.push({ time: Date.parse(point.polledAt), value: point.value })
      byLocation.set(point.location, line)
    }

    return [...byLocation].sort(([a], [b]) => a.localeCompare(b))
  }, [data])

  function toggle(location: string) {
    setHidden((current) =>
      current.includes(location)
        ? current.filter((item) => item !== location)
        : [...current, location],
    )
  }

  if (error) {
    return (
      <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircleIcon aria-hidden="true" className="size-5" />
        <span>Could not load the trend.</span>
      </div>
    )
  }

  if (!data && fetching) {
    return <Spinner aria-label="Loading trend" className="size-5 text-muted-foreground" />
  }

  if (lines.length === 0) {
    return <p className="text-sm text-muted-foreground">No data in this period.</p>
  }

  const tickFormat = new Intl.DateTimeFormat(undefined, TickFormats[range])
  const tooltipFormat = new Intl.DateTimeFormat(undefined, TooltipFormat)

  return (
    <figure aria-label={`${metric.label} trend`} className="flex w-full flex-col gap-3">
      <div
        role="group"
        aria-label="Locations"
        className="order-last flex flex-wrap gap-x-4 gap-y-2"
      >
        {lines.map(([location], index) => (
          <button
            key={location}
            type="button"
            aria-pressed={!hidden.includes(location)}
            onClick={() => toggle(location)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground aria-[pressed=false]:opacity-40"
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full"
              style={{ background: lineColor(index, lines.length) }}
            />
            {location}
          </button>
        ))}
      </div>

      <ChartContainer config={{}} className="aspect-auto h-72 w-full">
        <LineChart margin={{ left: 0, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(time: number) => tickFormat.format(time)}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis tickLine={false} axisLine={false} width={48} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, [item]) => tooltipFormat.format(item?.payload.time)}
              />
            }
          />
          {lines.map(([location, points], index) => (
            <Line
              key={location}
              data={points}
              dataKey="value"
              name={location}
              hide={hidden.includes(location)}
              stroke={lineColor(index, lines.length)}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </figure>
  )
}

function lineColor(index: number, count: number): string {
  return `oklch(0.62 0.15 ${(index * 360) / count})`
}
