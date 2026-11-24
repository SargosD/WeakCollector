import { AlertCircleIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from 'urql'
import { Spinner } from '@/components/ui/spinner'
import {
  AggregateFunction,
  MeasurementValueType,
  MetricsDocument,
  TimeRange,
} from '@/types/graphql'
import { AggregateSelect } from './AggregateSelect'
import { MetricSelect } from './MetricSelect'
import { RangeSelect } from './RangeSelect'
import { TrendChart } from './TrendChart'
import { metricOptions } from './utils/metricOptions'

export function ChartsSection() {
  const [range, setRange] = useState(TimeRange.LastDay)
  const [aggregate, setAggregate] = useState(AggregateFunction.Avg)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [{ data, error, fetching }] = useQuery({ query: MetricsDocument, variables: { range } })

  const metrics = useMemo(() => metricOptions(data?.metrics ?? []), [data])
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
        {error && (
          <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircleIcon aria-hidden="true" className="size-5" />
            <span>Could not load metrics.</span>
          </div>
        )}

        {!error && !data && fetching && (
          <Spinner aria-label="Loading metrics" className="size-5 text-muted-foreground" />
        )}

        {!error && data && !metric && (
          <p className="text-sm text-muted-foreground">No metrics in this period.</p>
        )}

        {!error && metric && (
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
            {metric.valueType === MeasurementValueType.Number ? (
              <TrendChart metric={metric} range={range} aggregate={aggregate} />
            ) : (
              <p className="text-sm text-muted-foreground">
                The timeline for on/off metrics is not available yet.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
