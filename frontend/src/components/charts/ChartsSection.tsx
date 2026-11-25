import { useMemo, useState } from 'react'
import { useQuery } from 'urql'
import { QueryState } from '@/components/shared/QueryState'
import { useRefetchOnPoll } from '@/realtime/hooks/useRefetchOnPoll'
import {
  AggregateFunction,
  MeasurementValueType,
  MetricsDocument,
  TimeRange,
} from '@/types/graphql'
import { AggregateSelect } from './controls/AggregateSelect'
import { AggregationChart } from './views/AggregationChart'
import { MetricSelect } from './controls/MetricSelect'
import { RangeSelect } from './controls/RangeSelect'
import { StateTimeline } from './views/StateTimeline'
import { TrendChart } from './views/TrendChart'
import { formatMetrics } from './utils/formatMetrics'

export function ChartsSection() {
  const [range, setRange] = useState(TimeRange.LastDay)
  const [aggregate, setAggregate] = useState(AggregateFunction.Avg)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [result, reexecute] = useQuery({
    query: MetricsDocument,
    variables: { range },
  })
  useRefetchOnPoll(reexecute)

  const { data } = result
  const metrics = useMemo(() => formatMetrics(data?.metrics ?? []), [data])
  const metric = metrics.find((item) => item.key === selectedKey) ?? metrics[0]

  return (
    <section aria-labelledby="charts-heading" className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="charts-heading" className="text-lg font-semibold">
          Charts
        </h2>
        <RangeSelect value={range} onChange={setRange} />
      </div>

      <div className="min-h-24 space-y-4">
        <QueryState
          result={result}
          isEmpty={!metric}
          messages={{
            error: 'Could not load metrics.',
            loading: 'Loading metrics',
            empty: 'No metrics in this period.',
          }}
        >
          {metric && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <MetricSelect
                  metrics={metrics}
                  value={metric}
                  onChange={(selected) => setSelectedKey(selected.key)}
                />
                {metric.valueType === MeasurementValueType.Number && (
                  <AggregateSelect value={aggregate} onChange={setAggregate} />
                )}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="min-w-0 space-y-3">
                  <h3 className="text-sm font-semibold">Over time</h3>
                  {metric.valueType === MeasurementValueType.Number ? (
                    <TrendChart metric={metric} range={range} aggregate={aggregate} />
                  ) : (
                    <StateTimeline metric={metric} range={range} />
                  )}
                </div>
                <div className="min-w-0 space-y-3">
                  <h3 className="text-sm font-semibold">By location</h3>
                  <AggregationChart metric={metric} range={range} aggregate={aggregate} />
                </div>
              </div>
            </>
          )}
        </QueryState>
      </div>
    </section>
  )
}
