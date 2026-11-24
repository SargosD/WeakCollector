import { AlertCircleIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useQuery } from 'urql'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Spinner } from '@/components/ui/spinner'
import { useRefetchOnPoll } from '@/live/pollUpdates'
import {
  AggregateFunction,
  AggregationDocument,
  MeasurementValueType,
  type TimeRange,
} from '@/types/graphql'
import type { Metric } from './utils/metricOptions'

type AggregationChartProps = {
  metric: Metric
  range: TimeRange
  aggregate: AggregateFunction
}

export function AggregationChart({ metric, range, aggregate }: AggregationChartProps) {
  const isOnOff = metric.valueType === MeasurementValueType.Boolean
  const [{ data, error, fetching }, reexecute] = useQuery({
    query: AggregationDocument,
    variables: {
      type: metric.type,
      name: metric.name,
      range,
      aggregate: isOnOff ? AggregateFunction.Avg : aggregate,
    },
  })
  useRefetchOnPoll(reexecute)

  const bars = useMemo(
    () =>
      (data?.aggregation ?? []).map((item) => ({
        location: item.location,
        value: isOnOff ? Math.round(item.value * 100) : Math.round(item.value * 100) / 100,
      })),
    [data, isOnOff],
  )

  if (error) {
    return (
      <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircleIcon aria-hidden="true" className="size-5" />
        <span>Could not load the aggregation.</span>
      </div>
    )
  }

  if (!data && fetching) {
    return <Spinner aria-label="Loading aggregation" className="size-5 text-muted-foreground" />
  }

  if (bars.length === 0) {
    return <p className="text-sm text-muted-foreground">No data in this period.</p>
  }

  return (
    <figure aria-label={`${metric.label} by location`} className="w-full">
      <ChartContainer
        config={{ value: { label: isOnOff ? 'True, % of polls' : metric.label } }}
        className="aspect-auto h-72 w-full"
      >
        <BarChart data={bars} margin={{ left: 0, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="location" tickLine={false} axisLine={false} interval={0} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            domain={isOnOff ? [0, 100] : [0, 'auto']}
            tickFormatter={isOnOff ? (value: number) => `${value}%` : undefined}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar
            dataKey="value"
            fill="var(--color-sky-500)"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </figure>
  )
}
