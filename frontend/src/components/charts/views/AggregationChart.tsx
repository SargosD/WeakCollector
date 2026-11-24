import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useQuery } from 'urql'
import { QueryState } from '@/components/shared/QueryState'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useRefetchOnPoll } from '@/realtime/hooks/useRefetchOnPoll'
import {
  AggregateFunction,
  AggregationDocument,
  MeasurementValueType,
  type TimeRange,
} from '@/types/graphql'
import type { Metric } from '@/components/charts/utils/formatMetrics'

type AggregationChartProps = {
  metric: Metric
  range: TimeRange
  aggregate: AggregateFunction
}

export function AggregationChart({ metric, range, aggregate }: AggregationChartProps) {
  const isBoolean = metric.valueType === MeasurementValueType.Boolean
  const [result, reexecute] = useQuery({
    query: AggregationDocument,
    variables: {
      type: metric.type,
      name: metric.name,
      range,
      aggregate: isBoolean ? AggregateFunction.Avg : aggregate,
    },
  })
  useRefetchOnPoll(reexecute)

  const bars = useMemo(
    () =>
      (result.data?.aggregation ?? []).map((item) => ({
        location: item.location,
        value: isBoolean ? Math.round(item.value * 100) : Math.round(item.value * 100) / 100,
      })),
    [result.data, isBoolean],
  )

  return (
    <QueryState
      result={result}
      isEmpty={bars.length === 0}
      messages={{
        error: 'Could not load the aggregation.',
        loading: 'Loading aggregation',
        empty: 'No data in this period.',
      }}
      className="h-72"
    >
      <figure aria-label={`${metric.label} by location`} className="w-full">
        <ChartContainer
          config={{ value: { label: isBoolean ? 'True, % of polls' : metric.label } }}
          className="aspect-auto h-72 w-full"
        >
          <BarChart data={bars} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="location" tickLine={false} axisLine={false} interval={0} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              domain={isBoolean ? [0, 100] : [0, 'auto']}
              tickFormatter={isBoolean ? (value: number) => `${value}%` : undefined}
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
    </QueryState>
  )
}
