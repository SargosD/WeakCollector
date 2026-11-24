import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { useQuery } from 'urql'
import { QueryState } from '@/components/shared/QueryState'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useRefetchOnPoll } from '@/realtime/hooks/useRefetchOnPoll'
import { type AggregateFunction, MeasurementTrendDocument, type TimeRange } from '@/types/graphql'
import type { Metric } from '@/components/charts/utils/formatMetrics'
import { DateTimeFormat } from '@/utils/dateFormats'
import { TickFormats } from '@/components/charts/utils/timeFormats'

type TrendChartProps = {
  metric: Metric
  range: TimeRange
  aggregate: AggregateFunction
}

export function TrendChart({ metric, range, aggregate }: TrendChartProps) {
  const [result, reexecute] = useQuery({
    query: MeasurementTrendDocument,
    variables: { type: metric.type, name: metric.name, range, aggregate },
  })
  useRefetchOnPoll(reexecute)
  const [hidden, setHidden] = useState<string[]>([])

  const lines = useMemo(() => {
    const byLocation = new Map<string, { time: number; value: number }[]>()

    for (const point of result.data?.measurementTrend ?? []) {
      const line = byLocation.get(point.location) ?? []
      line.push({ time: Date.parse(point.polledAt), value: point.value })
      byLocation.set(point.location, line)
    }

    return [...byLocation].sort(([a], [b]) => a.localeCompare(b))
  }, [result.data])

  function toggle(location: string) {
    setHidden((current) =>
      current.includes(location)
        ? current.filter((item) => item !== location)
        : [...current, location],
    )
  }

  const tickFormat = new Intl.DateTimeFormat(undefined, TickFormats[range])

  return (
    <QueryState
      result={result}
      isEmpty={lines.length === 0}
      messages={{
        error: 'Could not load the trend.',
        loading: 'Loading trend',
        empty: 'No data in this period.',
      }}
      className="h-72"
    >
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
                  labelFormatter={(_, [item]) => DateTimeFormat.format(item?.payload.time)}
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
    </QueryState>
  )
}

function lineColor(index: number, count: number): string {
  return `oklch(0.62 0.15 ${(index * 360) / count})`
}
